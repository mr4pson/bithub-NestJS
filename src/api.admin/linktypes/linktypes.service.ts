import { Injectable } from "@nestjs/common";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CLinktype } from "src/model/entities/linktype";
import { DataSource, In } from "typeorm";
import { ILinktypeCreate } from "./dto/linktype.create.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CImagableService } from "src/common/services/imagable.service";
import { IKeyValue } from "src/model/keyvalue.interface";
import { CUploadsService } from "src/common/services/uploads.service";
import { CAppService } from "src/common/services/app.service";
import { ILinktypeUpdate } from "./dto/linktype.update.interface";

@Injectable()
export class CLinktypesService extends CImagableService {
    protected entity: string = "CLinktype";
    protected folder: string = "linktypes";
    protected resizeMap: IKeyValue<number> = {img: 100};

    constructor(
        protected dataSource: DataSource,
        protected uploadsService: CUploadsService,
        protected appService: CAppService,
        protected errorsService: CErrorsService,
    ) 
    {
        super(uploadsService, dataSource);
    }

    public async chunk(dto: IGetList): Promise<IResponse<CLinktype[]>> {
        try {            
            const data = await this.dataSource.getRepository(CLinktype).find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from});
            const elementsQuantity = await this.dataSource.getRepository(CLinktype).count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CLinktypesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CLinktype>> {
        try {
            const data = await this.dataSource.getRepository(CLinktype).findOne({where: {id}});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "linktype not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CLinktypesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.dataSource.getRepository(CLinktype).findOneBy({id});
            await this.deleteUnbindedImgOnDelete([x], false);
            await this.dataSource.getRepository(CLinktype).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CLinktypesService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            const xl = await this.dataSource.getRepository(CLinktype).findBy({id: In(ids)});  
            await this.deleteUnbindedImgOnDelete(xl, false);
            await this.dataSource.getRepository(CLinktype).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CLinktypesService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CLinktype>> {        
        try { 
            const dto = JSON.parse(fd.data) as ILinktypeCreate;
            const x = this.dataSource.getRepository(CLinktype).create(dto);
            await this.buildImg(x, uploads);
            await this.dataSource.getRepository(CLinktype).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CLinktypesService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CLinktype>> {
        try {
            const dto = JSON.parse(fd.data) as ILinktypeUpdate;
            const x = this.dataSource.getRepository(CLinktype).create(dto);
            const old = await this.dataSource.getRepository(CLinktype).findOneBy({id: x.id});
            await this.buildImg(x, uploads);
            await this.deleteUnbindedImgOnUpdate(x, old); // if img changed then delete old file
            await this.dataSource.getRepository(CLinktype).save(x);            
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CLinktypesService.update", err);
            return {statusCode: 500, error};
        } 
    }
}
