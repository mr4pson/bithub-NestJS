import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CAward } from "src/model/entities/award";
import { CLang } from "src/model/entities/lang";
import { DataSource } from "typeorm";
import { IAward } from "./dto/award.interface";

@Injectable()
export class CAwardsService {
    constructor(
        protected dataSource: DataSource,
        protected errorsService: CErrorsService,
    ) {}

    public async all(): Promise<IResponse<IAward[]>> {
        try {
            const awards = await this.dataSource.getRepository(CAward).find({where: {active: true}, order: {"date": -1}, relations: ["translations"]});
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}}); 
            const data = awards.map(a => this.buildAward(a, langs));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.landing/CAwardsService.all", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////
    // utils
    /////////////////

    public buildAward(award: CAward, langs: CLang[]): IAward {
        const date = new Date(award.date);
        const data: IAward = {
            id: award.id,
            name: {},
            img: award.img,
            investments: award.investments,
            earnings: award.earnings,
            month: date.getMonth() + 1,
            year: date.getFullYear(),
        };

        for (let l of langs) {
            const t = award.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;            
        }

        return data;
    }
}