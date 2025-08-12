import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CArtcat } from "src/model/entities/artcat";
import { CLang } from "src/model/entities/lang";
import { DataSource } from "typeorm";
import { IArtcat } from "./dto/artcat.interface";

@Injectable()
export class CArtcatsService {
    constructor(
        protected dataSource: DataSource,
        protected errorsService: CErrorsService,
    ) {}

    public async all(): Promise<IResponse<IArtcat[]>> {
        try {
            const artcats = await this.dataSource.getRepository(CArtcat).find({order: {"pos": 1}, relations: ["translations"]});
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}}); 
            const data = artcats.map(c => this.buildArtcat(c, langs));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CArtcatsService.all", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////
    // utils
    /////////////////

    public buildArtcat(artcat: CArtcat, langs: CLang[]): IArtcat {
        const data: IArtcat = {
            id: artcat.id,
            name: {},
        };

        for (let l of langs) {
            const t = artcat.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;            
        }

        return data;
    }
}