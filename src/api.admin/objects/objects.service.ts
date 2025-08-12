import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { IResponse } from 'src/model/dto/response.interface';
import { IUpdateParam } from "src/model/dto/updateparam.interface";
import { CErrorsService } from "src/common/services/errors.service";


@Injectable()
export class CObjectsService {
    constructor (
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async updateParam (dto: IUpdateParam): Promise<IResponse<void>> {        
        try {  
            await this.dataSource.getRepository(dto.obj).update(dto.id, {[dto.p]: dto.v})                                  
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CObjectsService.updateParam", err);
            return {statusCode: 500, error};
        }
    }

    // В наборе сущностей только одна может иметь значение эгоистичного параметра, равное true.
    // Также параметр-эгоист может быть таковым в подмножествах (проекционно-эгоистичным), например, регионально-эгоистичный, 
    // т.е. среди объектов с region_id=N только один может иметь значение параметра-эгоиста, равное true,
    // для этого используется filter
    public async updateEgoisticParam (dto: IUpdateParam): Promise<IResponse<void>> {        
        try {            
            if (dto.v) {  
                await this.dataSource.getRepository(dto.obj).update(dto.filter, {[dto.p]: false} as any);
            }
            
            await this.dataSource.getRepository(dto.obj).update(dto.id, {[dto.p]: dto.v});
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CObjectsService.updateEgoisticParam", err);
            return {statusCode: 500, error};
        }
    }    
}
