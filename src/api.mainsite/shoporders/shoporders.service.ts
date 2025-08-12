import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { DataSource } from "typeorm";
import { IShoporderCreate } from "./dto/shoporder.create.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CShoporder } from "src/model/entities/shoporder";
import { CUser } from "src/model/entities/user";
import { CAdmin } from "src/model/entities/admin";
import { CMailService } from "src/common/services/mailable/mail.service";

@Injectable()
export class CShopordersService {
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
        protected mailService: CMailService,
    ) {}

    public async create(user_id: number, dto: IShoporderCreate): Promise<IResponse<void>> {
        try {
            const user = await this.dataSource.getRepository(CUser).findOne({where: {id: user_id}});
            const shoporder: Partial<CShoporder> = {email: user.email, tg: dto.tg, comment: dto.comment, shopitem_id: dto.shopitem_id};
            const created = await this.dataSource.getRepository(CShoporder).save(shoporder);
            this.notifyOnCreate(created);
            return {statusCode: 201};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CShopordersService.create", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////
    // utils
    /////////////////

    private async notifyOnCreate(shoporder: CShoporder): Promise<void> {
        try {
            const admins = await this.dataSource.getRepository(CAdmin).find({where: {active: true, hidden: false, group_id: 1}}); // только владельцам

            for (let admin of admins) {
                await this.mailService.adminShoporder(admin.email, shoporder);
            }
        } catch (err) {
            await this.errorsService.log("api.mainsite/CShopordersService.notifyOnCreate", err);
        }
    }
}
