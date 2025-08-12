import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CInorder } from "src/model/entities/inorder";
import { DataSource } from "typeorm";

@Injectable()
export class CInordersService {
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CInorder[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `inorders.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.dataSource
                .getRepository(CInorder)
                .createQueryBuilder("inorders")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.dataSource
                .getRepository(CInorder)
                .createQueryBuilder("inorders")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CInordersService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CInorder>> {
        try {
            const data = await this.dataSource.getRepository(CInorder).findOne({where: {id}});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "inorder not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CInordersService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CInorder).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CInordersService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.dataSource.getRepository(CInorder).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CInordersService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    ///////////////
    // utils
    ///////////////

    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.from !== undefined) {
            filter += ` AND inorders.created_at >= '${dtoFilter.from}'`;
        }

        if (dtoFilter.to !== undefined) {
            filter += ` AND inorders.created_at <= '${dtoFilter.to}'`;
        }        

        if (dtoFilter.user_email) {
            filter += ` AND LOWER(inorders.user_email) LIKE LOWER('%${dtoFilter.user_email}%')`;
        }

        return filter;
    }
}