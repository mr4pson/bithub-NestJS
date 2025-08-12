import { Injectable } from "@nestjs/common";
import { CAppService } from "src/common/services/app.service";
import { CErrorsService } from "src/common/services/errors.service";
import { CImagableService } from "src/common/services/imagable.service";
import { CUploadsService } from "src/common/services/uploads.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { IResponse } from "src/model/dto/response.interface";
import { CAward } from "src/model/entities/award";
import { IKeyValue } from "src/model/keyvalue.interface";
import { DataSource, In } from "typeorm";
import { IAwardCreate } from "./dto/award.create.interface";
import { IAwardUpdate } from "./dto/award.update.interface";

@Injectable()
export class CAwardsService extends CImagableService {
    protected entity: string = "CAward";
    protected folder: string = "awards";
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

    public async chunk(dto: IGetList): Promise<IResponse<CAward[]>> {
        try {            
            const data = await this.dataSource.getRepository(CAward).find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from, relations: ["translations"]});
            const elementsQuantity = await this.dataSource.getRepository(CAward).count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CAwardsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CAward>> {
        try {
            const data = await this.dataSource.getRepository(CAward).findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "award not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CAwardsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.dataSource.getRepository(CAward).findOneBy({id});
            await this.deleteUnbindedImgOnDelete([x], false);
            await this.dataSource.getRepository(CAward).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CAwardsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            const xl = await this.dataSource.getRepository(CAward).findBy({id: In(ids)});  
            await this.deleteUnbindedImgOnDelete(xl, false);
            await this.dataSource.getRepository(CAward).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CAwardsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CAward>> {        
        try { 
            const dto = JSON.parse(fd.data) as IAwardCreate;
            const x = this.dataSource.getRepository(CAward).create(dto);
            await this.buildImg(x, uploads);
            await this.dataSource.getRepository(CAward).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CAwardsService.create", err);
            return {statusCode: 500, error};
        }        
    }

    public async update(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CAward>> {
        try {
            const dto = JSON.parse(fd.data) as IAwardUpdate;
            const x = this.dataSource.getRepository(CAward).create(dto);
            const old = await this.dataSource.getRepository(CAward).findOneBy({id: x.id});
            await this.buildImg(x, uploads);
            await this.deleteUnbindedImgOnUpdate(x, old); // if img changed then delete old file
            await this.dataSource.getRepository(CAward).save(x);     
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CAwardsService.update", err);
            return {statusCode: 500, error};
        } 
    }

    //////////////////
    // utils
    //////////////////

    private async fakeInit(): Promise<void> {
        for (let i = 0; i < 12; i++) {
            const x = new CAward().fakeInit(i);
            await this.dataSource.getRepository(CAward).save(x);
        }
    }
}
