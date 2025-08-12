import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { CNetworkService } from "src/common/services/network.service";
import { CInorder } from "src/model/entities/inorder";
import { DataSource } from "typeorm";
import { IInorderCreate } from "./dto/inorder.create.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CUser } from "src/model/entities/user";
import { CSetting } from "src/model/entities/setting";
import { cfg } from "src/app.config";
import { IWpCreate, IWpEvent, IWpOrder, IWpOrderData } from "./dto/whitepay";
import { HmacSHA256 } from "crypto-js";
import { CSocketGateway } from "src/socket/socket.gateway";
import { CReforder } from "src/model/entities/reforder";

@Injectable()
export class CInordersService {
    constructor(
        private errorsService: CErrorsService,
        private networkService: CNetworkService,
        private socketGateway: CSocketGateway,
        private dataSource: DataSource,
    ) {}

    public async create(dto: IInorderCreate, user_id: number): Promise<IResponse<string>> {
        try {
            const user = await this.dataSource.getRepository(CUser).findOne({where: {id: user_id, active: true}});
            if (!user) return {statusCode: 404, error: "user not found"};
            const inorder = this.dataSource.getRepository(CInorder).create({
                user_email: user.email,
                expected_amount: dto.amount,
            });
            await this.dataSource.getRepository(CInorder).save(inorder);
            const url = await this.whitepayCreateOrder(inorder, dto.lang_slug);
            return {statusCode: 201, data: url};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CInordersService.create", err);
            return {statusCode: 500, error};
        }
    }

    public async complete(dto: IWpEvent, signature: string): Promise<string> {
        try {
            console.log(`wp-event-received ${new Date}`);
            console.log(dto);
            const secret = (await this.dataSource.getRepository(CSetting).findOneBy({p: "whitepay-whtoken"}))?.v;
            if (!secret) throw "whitepay webhook token not found";
            const payloadJson = JSON.stringify(dto);
            const computedSignature = HmacSHA256(payloadJson, secret).toString();
            if (computedSignature !== signature) throw "invalid signature";

            if (dto.event_type === "transaction::completed") {
                // обрабатываем ордер
                const order = await this.whitepayGetOrder(dto.transaction.order_id);
                const amount = parseFloat(dto.transaction.value) * parseFloat(order.exchange_rate); // фактически полученная сумма: сумма транзакции на курс валют из ордера
                const inorder = await this.dataSource.getRepository(CInorder).findOne({where: {outer_id: order.id}});
                if (!inorder) throw "inorder not found";
                inorder.received_amount = amount;
                inorder.completed = true;
                await this.dataSource.getRepository(CInorder).save(inorder);
                
                // обновляем юзера
                const user = await this.dataSource.getRepository(CUser).findOne({where: {email: inorder.user_email}, relations: ["referrer"]});
                if (!user) throw "user not found";
                user.money += amount;                
                await this.dataSource.getRepository(CUser).save(user);
                this.socketGateway.broadcast({event: `user:reload:${user.id}`});
                
                // переводим откат рефереру, если есть
                const referrer = user.referrer;

                if (referrer && referrer.active && referrer.referral_percent) {
                    const otkat = parseFloat((amount / 100 * referrer.referral_percent).toFixed());
                    referrer.money += otkat;
                    await this.dataSource.getRepository(CUser).save(referrer);
                    const reforder = this.dataSource.getRepository(CReforder).create({referrer_email: referrer.email, referee_email: user.email, amount: otkat});
                    await this.dataSource.getRepository(CReforder).save(reforder);
                    this.socketGateway.broadcast({event: `user:reload:${referrer.id}`});
                }

                // закрываем ордер в whitepay, если он не закрыт
                order.status !== "COMPLETE" && await this.whitepayCompleteOrder(order.id);                 
            }     
            
            console.log(`wp-event-ok ${new Date}`);
            return "ok";
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CInordersService.complete", err);
        }
    }

    /////////////////
    // utils
    /////////////////

    private async whitepayCreateOrder(inorder: CInorder, lang_slug: string): Promise<string> {
        const url = (await this.dataSource.getRepository(CSetting).findOneBy({p: "whitepay-url-create-order"}))?.v;
        const token = (await this.dataSource.getRepository(CSetting).findOneBy({p: "whitepay-token"}))?.v;

        if (!url || !token) {
            throw "whitepay setting not found";
        }

        const dto: IWpCreate = {
            amount: inorder.expected_amount.toString(),
            currency: "USD",
            external_order_id: inorder.id.toString(),
            successful_link: `${cfg.mainsiteUrl}/${lang_slug}/payment-success`,
            failure_link: `${cfg.mainsiteUrl}/${lang_slug}/payment-fail`,
        };
        const headers = {"Authorization": `Bearer ${token}`};
        const res = await this.networkService.post(url, dto, {headers});
        const data = res.data as IWpOrderData;
        inorder.outer_id = data.order.id;
        await this.dataSource.getRepository(CInorder).save(inorder);
        return data.order.acquiring_url;
    }

    private async whitepayGetOrder(order_id: string): Promise<IWpOrder> {
        let url = (await this.dataSource.getRepository(CSetting).findOneBy({p: "whitepay-url-get-order"}))?.v;
        const token = (await this.dataSource.getRepository(CSetting).findOneBy({p: "whitepay-token"}))?.v;

        if (!url || !token) {
            throw "whitepay setting not found";
        }
        
        url = url.replace(/{{order_id}}/g, order_id);
        const headers = {"Authorization": `Bearer ${token}`};
        const res = await this.networkService.get(url, {headers});
        const data = res.data as IWpOrderData;

        if (!data.order) {
            throw "order not found in whitepay";
        }

        return data.order;        
    }

    private async whitepayCompleteOrder(order_id: string): Promise<IWpOrder> {
        let url = (await this.dataSource.getRepository(CSetting).findOneBy({p: "whitepay-url-complete-order"}))?.v;
        const token = (await this.dataSource.getRepository(CSetting).findOneBy({p: "whitepay-token"}))?.v;

        if (!url || !token) {
            throw "whitepay setting not found";
        }
        
        url = url.replace(/{{order_id}}/g, order_id);
        const headers = {"Authorization": `Bearer ${token}`};
        const res = await this.networkService.post(url, {}, {headers});
        const data = res.data as IWpOrderData;

        if (!data.order) {
            throw "order not found in whitepay";
        }

        return data.order;   
    }

    
    private test(): void {
        const payloadJson = JSON.stringify({
            "transaction": {
                "id": "14b7203b-c020-4297-b055-51f27e2a2ad2",
                "order_id": "c074ea74-c538-4166-95af-0efabcfe8606",
                "external_order_id": "1",
                "stock_orders": [],
                "currency": "USDC",
                "value": "9.996",
                "is_internal": true,
                "type": "DEPOSIT",
                "status": "COMPLETE",
                "hash": "WB_PAY_08b3091c-6e09-4c50-b4db-1bc0ab3e7a43",
                "created_at": "2023-08-25 18:28:21",
                "completed_at": "2023-08-25 18:28:21"
            },
            "event_type": "transaction::completed"
        });
        const computedSignature = HmacSHA256(payloadJson, "43f5fd17dc31ac654af671e1d753e4e9ac80af5bc0ac6a51b8988210aac25ed9").toString();
        console.log(computedSignature);
    }
}