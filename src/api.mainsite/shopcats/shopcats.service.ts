import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CShopcat } from "src/model/entities/shopcat";
import { CLang } from "src/model/entities/lang";
import { DataSource } from "typeorm";
import { IShopcat } from "./dto/shopcat.interface";

@Injectable()
export class CShopcatsService {
    constructor(
        protected dataSource: DataSource,
        protected errorsService: CErrorsService,
    ) {}

    public async all(): Promise<IResponse<IShopcat[]>> {
        try {
            const shopcats = await this.dataSource.getRepository(CShopcat).find({order: {"pos": 1}, relations: ["translations"]});
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});
            const data = shopcats.map(c => this.buildShopcat(c, langs));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CShopcatsService.all", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////
    // utils
    /////////////////

    public buildShopcat(shopcat: CShopcat, langs: CLang[]): IShopcat {
        const data: IShopcat = {
            id: shopcat.id,
            name: {},
        };

        for (let l of langs) {
            const t = shopcat.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }
}