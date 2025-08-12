import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { IResponse } from "src/model/dto/response.interface";
import { CTariff } from "src/model/entities/tariff";
import { DataSource } from "typeorm";
import { ITariffCreate } from "./dto/tariff.create.interface";
import { ITariffUpdate } from "./dto/tariff.update.interface";

@Injectable()
export class CTariffsService {
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CTariff[]>> {
        try {
            const data = await this.dataSource.getRepository(CTariff).find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from, relations: ["translations"]});
            const elementsQuantity = await this.dataSource.getRepository(CTariff).count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CTariffsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CTariff>> {
        try {
            const data = await this.dataSource.getRepository(CTariff).findOne({where: {id}, relations: ["translations"]});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "tariff not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CTariffsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CTariff).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CTariffsService.delete", err);
            return {statusCode: 500, error};
        }
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CTariff).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CTariffsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CTariff>> {
        try {
            const dto = JSON.parse(fd.data) as ITariffCreate;
            const x = this.dataSource.getRepository(CTariff).create(dto);
            await this.dataSource.getRepository(CTariff).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CTariffsService.create", err);
            return {statusCode: 500, error};
        }
    }

    public async update(fd: IJsonFormData): Promise<IResponse<CTariff>> {
        try {
            const dto = JSON.parse(fd.data) as ITariffUpdate;
            const x = this.dataSource.getRepository(CTariff).create(dto);
            await this.dataSource.getRepository(CTariff).save(x);
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CTariffsService.update", err);
            return {statusCode: 500, error};
        }
    }
}
