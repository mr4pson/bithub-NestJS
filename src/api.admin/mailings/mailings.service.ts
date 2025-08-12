import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { IResponse } from "src/model/dto/response.interface";
import { CMailing, TMailingStatus } from "src/model/entities/mailing";
import { DataSource } from "typeorm";
import { IMailingCreate } from "./dto/mailing.create.interface";
import { IMailingUpdate } from "./dto/mailing.update.interface";
import { CMailService } from "src/common/services/mailable/mail.service";

@Injectable()
export class CMailingsService {
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
        private mailService: CMailService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CMailing[]>> {
        try {
            const data = await this.dataSource.getRepository(CMailing).find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from});
            const elementsQuantity = await this.dataSource.getRepository(CMailing).count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CMailingsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CMailing>> {
        try {
            const data = await this.dataSource
                .getRepository(CMailing)
                .createQueryBuilder("mailing")
                .addSelect("mailing.recipients")
                .where(`mailing.id=${id}`)
                .getOne();
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "mailing not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CMailingsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async oneShort(id: number): Promise<IResponse<CMailing>> {
        try {
            const data = await this.dataSource.getRepository(CMailing).findOne({where: {id}});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "mailing not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CMailingsService.oneShort", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CMailing).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CMailingsService.delete", err);
            return {statusCode: 500, error};
        }
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CMailing).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CMailingsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CMailing>> {
        try {
            const dto = JSON.parse(fd.data) as IMailingCreate;
            const x = this.dataSource.getRepository(CMailing).create(dto);
            await this.dataSource.getRepository(CMailing).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CMailingsService.create", err);
            return {statusCode: 500, error};
        }
    }

    public async update(fd: IJsonFormData): Promise<IResponse<CMailing>> {
        try {
            const dto = JSON.parse(fd.data) as IMailingUpdate;
            const x = this.dataSource.getRepository(CMailing).create(dto);
            await this.dataSource.getRepository(CMailing).save(x);
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CMailingsService.update", err);
            return {statusCode: 500, error};
        }
    }

    public async run(id: number): Promise<IResponse<void>> {
        try {
            const mailing = await this.dataSource
                .getRepository(CMailing)
                .createQueryBuilder("mailing")
                .addSelect("mailing.recipients")
                .where(`mailing.id=${id}`)
                .getOne();
            if (!mailing) return {statusCode: 404, error: "mailing not found"};
            await this.dataSource.getRepository(CMailing).update({id}, {status: "running"});
            this.send(mailing);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CMailingsService.run", err);
            return {statusCode: 500, error};
        }
    }

    /////////////////////
    // utils
    /////////////////////

    private async send(mailing: CMailing): Promise<void> {
        try {
            const recipients = mailing.recipients?.split("\n").map(r => r.trim()).filter(r => r);

            if (!recipients?.length) {
                await this.dataSource.getRepository(CMailing).update({id: mailing.id}, {status: "idle", running_status: null});
                return;
            }

            for (let i = 0; i < recipients.length; i++) {
                await this.dataSource.getRepository(CMailing).update({id: mailing.id}, {running_status: `(${i+1}/${recipients.length})`});
                await this.mailService.sendMessage(recipients[i], mailing.subject, mailing.content);
            }

            await this.dataSource.getRepository(CMailing).update({id: mailing.id}, {status: "idle", running_status: null});
        } catch (err) {
            await this.dataSource.getRepository(CMailing).update({id: mailing.id}, {status: "error", running_status: null});
        }
    }
}