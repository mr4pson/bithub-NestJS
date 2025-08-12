import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { CFile } from "src/model/entities/file";
import { IResponse } from 'src/model/dto/response.interface';
import { IFileCreate } from "./dto/file.create.interface";
import { IFileUpdate } from "./dto/file.update.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CUploadsService } from "src/common/services/uploads.service";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CFilesService {
    constructor (
        private dataSource: DataSource,
        private uploadsService: CUploadsService,
        private errorsService: CErrorsService,
    ) {}    

    public async chunk(dto: IGetList): Promise<IResponse<CFile[]>> {
        try {
            const filter = this.buildFilter(dto.filter);
            const sortBy = `files.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.dataSource
                .getRepository(CFile)
                .createQueryBuilder("files")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.dataSource.getRepository(CFile).createQueryBuilder("files").where(filter).getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CFilesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CFile>> {
        try {
            const data = await this.dataSource.getRepository(CFile).findOneBy({id});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "file not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CFilesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.dataSource.getRepository(CFile).findOneBy({id});
            await this.deleteUnbindedFiles(x);
            await this.dataSource.getRepository(CFile).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CFilesService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {   
            const xl = await this.dataSource.getRepository(CFile).findByIds(ids);  
            await this.deleteUnbindedFiles(xl);
            await this.dataSource.getRepository(CFile).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CFilesService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(dto: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CFile>> {        
        try {       
            const data = JSON.parse(dto.data) as IFileCreate;
            const x = this.dataSource.getRepository(CFile).create(data);
            const upload = uploads.find(u => u.fieldname === 'fileurl');
            x.fileurl = await this.uploadsService.fileUpload(upload, "others");
            x.filename = upload.originalname;
            x.filetype = upload.mimetype;        
            await this.dataSource.getRepository(CFile).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CFilesService.create", err);
            return {statusCode: 500, error};
        }        
    }

    public async update(dto: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CFile>> {
        try {
            const data = JSON.parse(dto.data) as IFileUpdate;
            const x = this.dataSource.getRepository(CFile).create(data);
            const upload = uploads.find(u => u.fieldname === 'fileurl');
            
            if (upload) {
                const old = await this.dataSource.getRepository(CFile).findOneBy({id: x.id});
                await this.deleteUnbindedFiles(old);
                x.fileurl = await this.uploadsService.fileUpload(upload, "others");
                x.filename = upload.originalname;
                x.filetype = upload.mimetype;
            }

            await this.dataSource.getRepository(CFile).save(x);             
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CFilesService.update", err);
            return {statusCode: 500, error};
        } 
    } 

    //////////////////////
    // utils
    //////////////////////
    
    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.mark) {
            filter += ` AND LOWER(files.mark) LIKE LOWER('%${dtoFilter.mark}%')`;
        }

        return filter;
    }
  
    private async deleteUnbindedFiles(data: CFile | CFile[]): Promise<void> {
        if (Array.isArray(data)) {
            for (let x of data) {
                if (x.fileurl) {
                    await this.uploadsService.fileDelete(`others/${x.fileurl}`);
                }
            }
        } else {
            if (data.fileurl) {
                await this.uploadsService.fileDelete(`others/${data.fileurl}`);
            }
        }
    }
}
