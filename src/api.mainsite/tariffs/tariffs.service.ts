import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CTariff } from "src/model/entities/tariff";
import { DataSource } from "typeorm";
import { ISubscriptionTariff } from "./dto/subscription.tariff.interface";
import { CLang } from "src/model/entities/lang";
import { IOnetimeTariff } from "./dto/onetime.tariff.interface";

@Injectable()
export class CTariffsService {
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async subscriptionAll(): Promise<IResponse<ISubscriptionTariff[]>> {
        try {
            const tariffs = await this.dataSource.getRepository(CTariff).find({where: {type: "subscription"}, relations: ["translations"]});
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});
            const data = tariffs.map(t => this.buildSubscriptionTariff(t, langs));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CTariffsService.subscriptionAll", err);
            return {statusCode: 500, error};
        }
    }

    public async onetimeOne(code: string): Promise<IResponse<IOnetimeTariff>> {
        try {
            const tariff = await this.dataSource.getRepository(CTariff).findOneBy({code});            
            if (!tariff) return {statusCode: 404, error: "tariff not found"};            
            const data = this.buildOnetimeTariff(tariff);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CTariffsService.onetimeOne", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////
    // utils
    /////////////////

    private buildSubscriptionTariff(tariff: CTariff, langs: CLang[]): ISubscriptionTariff {
        const data: ISubscriptionTariff = {
            id: tariff.id,
            price: tariff.price,
            period: tariff.period,
            top: tariff.top,
            name: {},
            note: {},
        };

        for (let l of langs) {
            const t = tariff.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;            
            data.note[l.slug] = t.note;  
        }

        return data;
    }

    private buildOnetimeTariff(tariff: CTariff): IOnetimeTariff {
        return {
            id: tariff.id,
            price: tariff.price,
        };
    }
}