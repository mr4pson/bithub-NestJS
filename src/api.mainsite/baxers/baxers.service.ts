import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { CBaxer } from "src/model/entities/baxer";
import { IResponse } from "src/model/dto/response.interface";
import { IBaxer } from "./dto/baxer.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { CSetting } from "src/model/entities/setting";
import { CAppService } from "src/common/services/app.service";
import { CLang } from "src/model/entities/lang";

@Injectable()
export class CBaxersService {
    constructor (
        private dataSource: DataSource,
        private errorsService: CErrorsService,
        private appService: CAppService,
    ) {} 
    
    public async all(): Promise<IResponse<IBaxer[]>> {
        try {
            const sRandomize = (await this.dataSource.getRepository(CSetting).findOne({where: {p: "site-rnd-banners"}}))?.v;                
            const randomize = sRandomize === "1";
            const baxers = await this.dataSource.getRepository(CBaxer).find({where: {active: true}, order: {pos: 1}, relations: ["translations"]});    
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});          
            const data = baxers.map(x => this.buildBaxer(x, langs));
            randomize && this.appService.arrayShuffle(data);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CBaxersService.all", err);
            return {statusCode: 500, error};
        }
    }    

    ////////////////
    // utils
    ////////////////
    
    private buildBaxer(baxer: CBaxer, langs: CLang[]): IBaxer {
        const data = {
            id: baxer.id,
            img: {},
            link: {},            
        };

        for (let l of langs) {
            const t = baxer.translations.find(t => t.lang_id === l.id);
            data.img[l.slug] = t.img;            
            data.link[l.slug] = t.link;            
        }

        return data;
    }
}
