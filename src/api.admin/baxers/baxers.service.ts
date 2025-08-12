import { Injectable } from "@nestjs/common";
import { DataSource, In } from "typeorm";
import { CBaxer } from "src/model/entities/baxer";
import { IResponse } from 'src/model/dto/response.interface';
import { IBaxerCreate } from "./dto/baxer.create.interface";
import { IBaxerUpdate } from "./dto/baxer.update.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CUploadsService } from "src/common/services/uploads.service";
import { CAppService } from "src/common/services/app.service";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CBaxersService {
    constructor (
        protected dataSource: DataSource,
        protected uploadsService: CUploadsService,
        protected appService: CAppService,
        protected errorsService: CErrorsService,        
    ) 
    {} 
    
    public async chunk(dto: IGetList): Promise<IResponse<CBaxer[]>> {
        try {            
            const data = await this.dataSource.getRepository(CBaxer).find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from});
            const elementsQuantity = await this.dataSource.getRepository(CBaxer).count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CBaxersService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CBaxer>> {
        try {
            const data = await this.dataSource.getRepository(CBaxer).findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "baxer not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CBaxersService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.dataSource.getRepository(CBaxer).findOne({where: {id}, relations: ["translations"]});
            await this.deleteUnbindedImgOnDelete([x]);
            await this.dataSource.getRepository(CBaxer).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CBaxersService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            const xl = await this.dataSource.getRepository(CBaxer).find({where: {id: In(ids)}, relations: ["translations"]});  
            await this.deleteUnbindedImgOnDelete(xl);
            await this.dataSource.getRepository(CBaxer).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CBaxersService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CBaxer>> {        
        try {   
            const dto = JSON.parse(fd.data) as IBaxerCreate;         
            const x = this.dataSource.getRepository(CBaxer).create(dto);
            await this.buildImg(x, uploads);
            await this.dataSource.getRepository(CBaxer).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CBaxersService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CBaxer>> {
        try {
            const dto = JSON.parse(fd.data) as IBaxerUpdate;         
            const x = this.dataSource.getRepository(CBaxer).create(dto);
            const old = await this.dataSource.getRepository(CBaxer).findOne({where: {id: x.id}, relations: ["translations"]});
            await this.buildImg(x, uploads);
            await this.deleteUnbindedImgOnUpdate(x, old); // if img changed then delete old file
            await this.dataSource.getRepository(CBaxer).save(x);       
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CBaxersService.update", err);
            return {statusCode: 500, error};
        } 
    }    

    //////////////////
    // utils
    //////////////////

    protected async buildImg(x: CBaxer, uploads: Express.Multer.File[]): Promise<void> {                        
        for (let t of x.translations) {
            if (!t.img) continue;
            const upload = uploads.find(u => u.fieldname === `img[${t.lang_id}]`);            
            if (!upload) continue;
            const paths = await this.uploadsService.imgUploadResize(upload, "baxers", [700]);
            t.img = paths[0];
        }
    }

    protected async deleteUnbindedImgOnUpdate(current: CBaxer, old: CBaxer): Promise<void> {        
        for (let currentTranslation of current.translations) {
            const oldTranslation = old.translations.find(t => t.lang_id === currentTranslation.lang_id);
            oldTranslation.img && oldTranslation.img !== currentTranslation.img && this.uploadsService.fileDelete(`images/baxers/${oldTranslation.img}`);            
        }
    }

    protected async deleteUnbindedImgOnDelete(xl: CBaxer[]): Promise<void> {        
        for (let x of xl) {
            for (let t of x.translations) {
                if (t.img) {
                    await this.uploadsService.fileDelete(`images/baxers/${t.img}`);
                }
            }
        }
    }
}
