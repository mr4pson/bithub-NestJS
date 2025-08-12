import { Injectable } from "@nestjs/common";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CShopcat } from "src/model/entities/shopcat";
import { DataSource } from "typeorm";
import { IShopcatCreate } from "./dto/shopcat.create.interface";
import { IShopcatUpdate } from "./dto/shopcat.update.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CShopcatsService{
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CShopcat[]>> {
        try {
            const data = await this.dataSource.getRepository(CShopcat).find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from, relations: ["translations"]});
            const elementsQuantity = await this.dataSource.getRepository(CShopcat).count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CShopcatsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CShopcat>> {
        try {
            const data = await this.dataSource.getRepository(CShopcat).findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "shopcat not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CShopcatsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CShopcat).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CShopcatsService.delete", err);
            return {statusCode: 500, error};
        }
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CShopcat).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CShopcatsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CShopcat>> {
        try {
            const dto = JSON.parse(fd.data) as IShopcatCreate;
            const x = this.dataSource.getRepository(CShopcat).create(dto);
            await this.dataSource.getRepository(CShopcat).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CShopcatsService.create", err);
            return {statusCode: 500, error};
        }
    }

    public async update(fd: IJsonFormData): Promise<IResponse<CShopcat>> {
        try {
            const dto = JSON.parse(fd.data) as IShopcatUpdate;
            const x = this.dataSource.getRepository(CShopcat).create(dto);
            await this.dataSource.getRepository(CShopcat).save(x);
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CShopcatsService.update", err);
            return {statusCode: 500, error};
        }
    }
}
