import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CCat } from "src/model/entities/cat";
import { CLang } from "src/model/entities/lang";
import { DataSource, FindOptionsWhere, MoreThan } from "typeorm";
import { ICat } from "./dto/cat.interface";
import { CUser } from "src/model/entities/user";
import { CUsersService } from "../users/users.service";

@Injectable()
export class CCatsService {
    constructor(
        protected dataSource: DataSource,
        protected errorsService: CErrorsService,
        protected usersService: CUsersService,
    ) {}

    public async all(user_id: number): Promise<IResponse<ICat[]>> {
        try {
            const filter: FindOptionsWhere<CCat> = await this.usersService.canSeePaidContent(user_id) ? {} : {paid: false};
            const cats = await this.dataSource.getRepository(CCat).find({where: filter, order: {"pos": 1}, relations: ["translations"]});
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});
            const data = cats.map(c => this.buildCat(c, langs));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CCatsService.all", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////
    // utils
    /////////////////

    private buildCat(cat: CCat, langs: CLang[]): ICat {
        const data: ICat = {
            id: cat.id,
            name: {},
        };

        for (let l of langs) {
            const t = cat.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }
}