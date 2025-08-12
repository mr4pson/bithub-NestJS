import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { IResponse } from "src/model/dto/response.interface";
import { CPromocode } from "src/model/entities/promocode";
import { DataSource } from "typeorm";
import { IPromocodeCreate } from "./dto/promocode.create.interface";
import { IPromocodeUpdate } from "./dto/promocode.update.interface";

@Injectable()
export class CPromocodesService {    
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CPromocode[]>> {
        try {    
            const filter = this.buildFilter(dto.filter);
            const sortBy = `promocodes.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.dataSource.getRepository(CPromocode)
                .createQueryBuilder("promocodes")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.dataSource.getRepository(CPromocode).createQueryBuilder("promocodes").where(filter).getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CPromocodesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CPromocode>> {
        try {
            const data = await this.dataSource.getRepository(CPromocode).findOne({where: {id}});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "promocode not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CPromocodesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CPromocode).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CPromocodesService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.dataSource.getRepository(CPromocode).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CPromocodesService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData): Promise<IResponse<CPromocode>> {        
        try { 
            const dto = JSON.parse(fd.data) as IPromocodeCreate;            
            const x = this.dataSource.getRepository(CPromocode).create(dto);
            await this.dataSource.getRepository(CPromocode).save(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CPromocodesService.create", err);
            return {statusCode: 500, error};
        }        
    }
    
    public async update(fd: IJsonFormData): Promise<IResponse<CPromocode>> {
        try {
            const dto = JSON.parse(fd.data) as IPromocodeUpdate;
            const x = this.dataSource.getRepository(CPromocode).create(dto);
            await this.dataSource.getRepository(CPromocode).save(x);            
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CPromocodesService.update", err);
            return {statusCode: 500, error};
        } 
    }

    ////////////////
    // utils
    ////////////////

    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.from !== undefined) {
            filter += ` AND promocodes.created_at >= '${dtoFilter.from}'`;
        }

        if (dtoFilter.to !== undefined) {
            filter += ` AND promocodes.created_at <= '${dtoFilter.to}'`;
        }

        if (dtoFilter.code) {
            filter += ` AND LOWER(promocodes.code) LIKE LOWER('%${dtoFilter.code}%')`;
        }

        return filter;
    }
}
