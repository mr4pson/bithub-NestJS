import { Injectable } from "@nestjs/common";
import { CAppService } from "src/common/services/app.service";
import { CImagableService } from "src/common/services/imagable.service";
import { CUploadsService } from "src/common/services/uploads.service";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CPage } from "src/model/entities/page";
import { DataSource, In, IsNull } from "typeorm";
import { IPageCreate } from "./dto/page.create.interface";
import { IPageUpdate } from "./dto/page.update.interface";
import { IKeyValue } from "src/model/keyvalue.interface";
import { CSlugService } from "src/common/services/slug.service";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CPagesService extends CImagableService {
    protected entity: string = "CPage";
    protected folder: string = "pages";
    protected resizeMap: IKeyValue<number> = {img: 300};

    constructor(
        protected dataSource: DataSource,
        protected uploadsService: CUploadsService,
        protected slugService: CSlugService,
        protected appService: CAppService,
        protected errorsService: CErrorsService,
    ) 
    {
        super(uploadsService, dataSource);
    }

    public async chunk(dto: IGetList): Promise<IResponse<CPage[]>> {
        try {            
            const pages = await this.dataSource.getRepository(CPage).find({where: {parent_id: IsNull()}, order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from, relations: ["translations"]});
            const elementsQuantity = await this.dataSource.getRepository(CPage).count();
            const elementsQuantityFirstLevel = await this.dataSource.getRepository(CPage).count({where: {parent_id: IsNull()}});
            const pagesQuantity = Math.ceil(elementsQuantityFirstLevel / dto.q);
            let data: CPage[] = [];

            for (let page of pages) {
                data.push(page);
                const children = await this.appService.buildChildrenList("CPage", page, dto.sortBy, dto.sortDir, false, ["translations"], 1) as CPage[];
                data = [...data, ...children];
            }            

            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CPagesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CPage>> {
        try {
            const data = await this.dataSource.getRepository(CPage).findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "page not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CPagesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.dataSource.getRepository(CPage).findOneBy({id});
            await this.deleteUnbindedImgOnDelete([x], true);
            await this.dataSource.getRepository(CPage).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CPagesService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            const xl = await this.dataSource.getRepository(CPage).findBy({id: In(ids)});  
            await this.deleteUnbindedImgOnDelete(xl, true);
            await this.dataSource.getRepository(CPage).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CPagesService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CPage>> {        
        try { 
            const dto = JSON.parse(fd.data) as IPageCreate;
            const x = this.dataSource.getRepository(CPage).create(dto);
            await this.buildImg(x, uploads);
            x.slug = await this.slugService.checkSlug(this.dataSource.getRepository(CPage), x);
            await this.dataSource.getRepository(CPage).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CPagesService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CPage>> {
        try {
            const dto = JSON.parse(fd.data) as IPageUpdate;
            const x = this.dataSource.getRepository(CPage).create(dto);
            const old = await this.dataSource.getRepository(CPage).findOneBy({id: x.id});
            await this.buildImg(x, uploads);
            await this.deleteUnbindedImgOnUpdate(x, old); // if img changed then delete old file
            x.slug = await this.slugService.checkSlug(this.dataSource.getRepository(CPage), x);
            await this.dataSource.getRepository(CPage).save(x);     
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CPagesService.update", err);
            return {statusCode: 500, error};
        } 
    }
}