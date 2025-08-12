import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CReforder } from "src/model/entities/reforder";
import { DataSource } from "typeorm";

@Injectable()
export class CRefordersService {
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CReforder[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `reforders.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.dataSource
                .getRepository(CReforder)
                .createQueryBuilder("reforders")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.dataSource
                .getRepository(CReforder)
                .createQueryBuilder("reforders")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CRefordersService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CReforder>> {
        try {
            const data = await this.dataSource.getRepository(CReforder).findOne({where: {id}});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "reforder not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CRefordersService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CReforder).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CRefordersService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.dataSource.getRepository(CReforder).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CRefordersService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    ///////////////
    // utils
    ///////////////

    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.from !== undefined) {
            filter += ` AND reforders.created_at >= '${dtoFilter.from}'`;
        }

        if (dtoFilter.to !== undefined) {
            filter += ` AND reforders.created_at <= '${dtoFilter.to}'`;
        }        

        if (dtoFilter.referrer_email) {
            filter += ` AND LOWER(reforders.referrer_email) LIKE LOWER('%${dtoFilter.referrer_email}%')`;
        }

        if (dtoFilter.referee_email) {
            filter += ` AND LOWER(reforders.referee_email) LIKE LOWER('%${dtoFilter.referee_email}%')`;
        }

        return filter;
    }
}