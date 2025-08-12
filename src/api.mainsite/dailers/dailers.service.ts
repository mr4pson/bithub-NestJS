import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { DataSource } from "typeorm";
import { IDailer } from "./dto/dailer";
import { CDailer } from "src/model/entities/dailer";
import { IDailerSave } from "./dto/dailer.save";
import { IGetList } from "src/model/dto/getlist.interface";

@Injectable()
export class CDailersService {
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList, user_id: number): Promise<IResponse<IDailer[]>> {
        try {       
            const dailers = await this.dataSource.getRepository(CDailer).find({where: {user_id}, order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from});
            const elementsQuantity = await this.dataSource.getRepository(CDailer).count({where: {user_id}});
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);             
            const data = dailers.map(x => this.buildDailer(x));
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CDailersService.chunk", err);
            return {statusCode: 500, error};
        }
    }  

    public async save(dto: IDailerSave, user_id: number): Promise<IResponse<IDailer>> {
        try {            
            if (dto.id) {
                let dailer = await this.dataSource.getRepository(CDailer).findOneBy({id: dto.id});
                if (!dailer) return {statusCode: 404, error: "dailer not found"};
                if (dailer.user_id !== user_id) return {statusCode: 401, error: "no permission to update dailer"};
                dailer = this.buildSafeUpdate(dto);
                await this.dataSource.getRepository(CDailer).save(dailer);
                const data = this.buildDailer(dailer);
                return {statusCode: 200, data};
            }

            const dailer = this.buildSafeCreate(dto, user_id);
            await this.dataSource.getRepository(CDailer).save(dailer);
            const data = this.buildDailer(dailer);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CDailersService.update", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number, user_id: number): Promise<IResponse<void>> {
        try {
            const dailer = await this.dataSource.getRepository(CDailer).findOneBy({id});
            if (!dailer) return {statusCode: 404, error: "dailer not found"};
            if (dailer.user_id !== user_id) return {statusCode: 401, error: "no permission to delete dailer"};
            await this.dataSource.getRepository(CDailer).remove(dailer);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CSettingsService.delete", err);
            return {statusCode: 500, error};
        }        
    }
    
    //////////////////
    // utils
    //////////////////

    private buildDailer(dailer: CDailer): IDailer {
        return {
            id: dailer.id,
            name: dailer.name,
            link: dailer.link,
            comment: dailer.comment,
            completed: dailer.completed,
        };
    }

    private buildSafeUpdate(dto: IDailerSave): CDailer {
        return this.dataSource.getRepository(CDailer).create({
            id: dto.id,
            name: dto.name,
            link: dto.link,
            comment: dto.comment,
            completed: dto.completed,
        });        
    } 

    private buildSafeCreate(dto: IDailerSave, user_id: number): CDailer {
        return this.dataSource.getRepository(CDailer).create({
            user_id,
            name: dto.name,
            link: dto.link,
            comment: dto.comment,
        });        
    } 
}