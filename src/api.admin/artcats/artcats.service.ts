import { Injectable } from "@nestjs/common";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CArtcat } from "src/model/entities/artcat";
import { DataSource } from "typeorm";
import { IArtcatCreate } from "./dto/artcat.create.interface";
import { IArtcatUpdate } from "./dto/artcat.update.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CArtcatsService{
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CArtcat[]>> {
        try {            
            const data = await this.dataSource.getRepository(CArtcat).find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from, relations: ["translations"]});
            const elementsQuantity = await this.dataSource.getRepository(CArtcat).count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CArtcatsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CArtcat>> {
        try {
            const data = await this.dataSource.getRepository(CArtcat).findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "artcat not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CArtcatsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CArtcat).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CArtcatsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.dataSource.getRepository(CArtcat).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CArtcatsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CArtcat>> {        
        try { 
            const dto = JSON.parse(fd.data) as IArtcatCreate;
            const x = this.dataSource.getRepository(CArtcat).create(dto);
            await this.dataSource.getRepository(CArtcat).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CArtcatsService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData): Promise<IResponse<CArtcat>> {
        try {
            const dto = JSON.parse(fd.data) as IArtcatUpdate;
            const x = this.dataSource.getRepository(CArtcat).create(dto);
            await this.dataSource.getRepository(CArtcat).save(x);     
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CArtcatsService.update", err);
            return {statusCode: 500, error};
        } 
    }
}
