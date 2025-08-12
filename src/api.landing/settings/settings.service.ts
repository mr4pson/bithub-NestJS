import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { CSetting } from "src/model/entities/setting";
import { IResponse } from 'src/model/dto/response.interface';
import { ISettings } from "./dto/settings.interface";
import { CErrorsService } from "src/common/services/errors.service";

@Injectable()
export class CSettingsService {
    constructor (
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}    

    public async all(): Promise<IResponse<ISettings>> {        
        try {
            const settings = await this.dataSource.getRepository(CSetting).find({where: [{load_to: "all"}, {load_to: "landing"}]});            
            const data = {};            

            for (let setting of settings) {
                data[setting.p] = setting.v;
            }

            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.landing/CSettingsService.all", err);
            return {statusCode: 500, error};
        }
    }    
}
