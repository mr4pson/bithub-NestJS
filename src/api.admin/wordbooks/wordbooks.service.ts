import { Injectable } from "@nestjs/common";
import { DataSource, DeleteResult, IsNull } from "typeorm";
import { CWordbook } from "src/model/entities/wordbook";
import { IResponse } from 'src/model/dto/response.interface';
import { IWordbookUpdate } from "./dto/wordbook.update.interface";
import { IWordbookCreate } from "./dto/wordbook.create.interface";
import { CWord } from "src/model/entities/word";
import { IGetList } from "src/model/dto/getlist.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CWordbooksService {
    constructor (
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}    

    public async chunk(dto: IGetList): Promise<IResponse<CWordbook[]>> {       
        try {            
            const data = await this.dataSource.getRepository(CWordbook).find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from});
            const elementsQuantity = await this.dataSource.getRepository(CWordbook).count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CWordbooksService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CWordbook>> {
        try {            
            // to sort joined array we need to use QueryBuilder instead of simple repository API!
            const data = await this.dataSource.getRepository(CWordbook)
                .createQueryBuilder("wordbooks")
                .where("wordbooks.id = :id", {id})
                .leftJoinAndSelect("wordbooks.words", "words")
                .leftJoinAndSelect("words.translations", "translations")
                .orderBy("words.pos", "ASC")
                .getOne();
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "wordbook not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CWordbooksService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CWordbook).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CWordbooksService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.dataSource.getRepository(CWordbook).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CWordbooksService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CWordbook>> {        
        try {   
            const dto = JSON.parse(fd.data) as IWordbookCreate;         
            const x = this.dataSource.getRepository(CWordbook).create(dto);
            await this.dataSource.getRepository(CWordbook).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CWordbooksService.create", err);
            return {statusCode: 500, error};
        }        
    }

    public async update(fd: IJsonFormData): Promise<IResponse<CWordbook>> {
        try {           
            const dto = JSON.parse(fd.data) as IWordbookUpdate;              
            const x = this.dataSource.getRepository(CWordbook).create(dto);
            await this.dataSource.getRepository(CWordbook).save(x);            
            await this.deleteUnbindedWords();
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CWordbooksService.update", err);
            return {statusCode: 500, error};
        } 
    }

    //////////////////////
    // utils    
    //////////////////////
    
    private deleteUnbindedWords(): Promise<DeleteResult> {
        return this.dataSource.getRepository(CWord).delete({wordbook_id: IsNull()});
    }  
}
