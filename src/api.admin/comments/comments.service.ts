import { Injectable } from "@nestjs/common";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CComment } from "src/model/entities/comment";
import { DataSource } from "typeorm";
import { ICommentCreate } from "./dto/comment.create.interface";
import { ICommentUpdate } from "./dto/comment.update.interface";
import { CErrorsService } from "src/common/services/errors.service";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";

@Injectable()
export class CCommentsService{
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CComment[]>> {
        try {
            const data = await this.dataSource.getRepository(CComment).find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from, relations: ["user", "guide", "guide.translations"]});
            const elementsQuantity = await this.dataSource.getRepository(CComment).count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCommentsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CComment>> {
        try {
            const data = await this.dataSource.getRepository(CComment).findOne({where: {id}});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "comment not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCommentsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async oneWithUser(id: number): Promise<IResponse<CComment>> {
        try {
            const data = await this.dataSource.getRepository(CComment).findOne({where: {id}, relations: ["user"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "comment not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCommentsService.oneWithUser", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CComment).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCommentsService.delete", err);
            return {statusCode: 500, error};
        }
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CComment).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCommentsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CComment>> {
        try {
            const dto = JSON.parse(fd.data) as ICommentCreate;
            const x = this.dataSource.getRepository(CComment).create(dto);
            await this.dataSource.getRepository(CComment).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCommentsService.create", err);
            return {statusCode: 500, error};
        }
    }

    public async update(fd: IJsonFormData): Promise<IResponse<CComment>> {
        try {
            const dto = JSON.parse(fd.data) as ICommentUpdate;
            const x = this.dataSource.getRepository(CComment).create(dto);
            await this.dataSource.getRepository(CComment).save(x);
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CCommentsService.update", err);
            return {statusCode: 500, error};
        }
    }
}
