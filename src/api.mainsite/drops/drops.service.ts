import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { DataSource } from "typeorm";
import { IDrop } from "./dto/drop.interface";
import { CDrop } from "src/model/entities/drop";
import { CLang } from "src/model/entities/lang";

@Injectable()
export class CDropsService {
    constructor(
        private errorsService: CErrorsService,
        private dataSource: DataSource,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<IDrop[]>> {
        try {
            const xl = await this.dataSource.getRepository(CDrop).find({take: dto.q, skip: dto.from, order: {[dto.sortBy]: dto.sortDir}, relations: ["translations"]});
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});
            const data = xl.map(x => this.buildDrop(x, langs));
            const elementsQuantity = await this.dataSource.getRepository(CDrop).count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CDropsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////
    // utils
    /////////////////

    private buildDrop(x: CDrop, langs: CLang[]): IDrop {
        const drop: IDrop = {
            id: x.id,
            name: x.name,
            link: {},
            img: x.img,
            drop: x.drop,
            early: x.early,
            score: x.score,
            spending_money: x.spending_money,
            spending_time: x.spending_time,
            tasks: {},
            term: x.term,
            fundrising: x.fundrising,
            invest: {},
            cat: x.cat,
            date: {},
        };

        for (const l of langs) {
            const t = x.translations.find(t => t.lang_id === l.id);
            drop.link[l.slug] = t.link;
            drop.tasks[l.slug] = t.tasks;
            drop.invest[l.slug] = t.invest;
            drop.date[l.slug] = new Date(x.date).toLocaleDateString(l.locale, {day: "numeric", month: "long", year: "numeric"});
        }

        return drop;
    }
}
