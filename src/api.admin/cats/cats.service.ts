import { Injectable } from "@nestjs/common";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CCat } from "src/model/entities/cat";
import { DataSource } from "typeorm";
import { ICatCreate } from "./dto/cat.create.interface";
import { ICatUpdate } from "./dto/cat.update.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CCatsService{
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CCat[]>> {
        try {            
            const data = await this.dataSource.getRepository(CCat).find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from, relations: ["translations"]});
            const elementsQuantity = await this.dataSource.getRepository(CCat).count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCatsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CCat>> {
        try {
            const data = await this.dataSource.getRepository(CCat).findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "cat not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCatsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CCat).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCatsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.dataSource.getRepository(CCat).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCatsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CCat>> {        
        try { 
            const dto = JSON.parse(fd.data) as ICatCreate;
            const x = this.dataSource.getRepository(CCat).create(dto);
            await this.dataSource.getRepository(CCat).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCatsService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData): Promise<IResponse<CCat>> {
        try {
            const dto = JSON.parse(fd.data) as ICatUpdate;
            const x = this.dataSource.getRepository(CCat).create(dto);
            await this.dataSource.getRepository(CCat).save(x);     
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCatsService.update", err);
            return {statusCode: 500, error};
        } 
    }
}
