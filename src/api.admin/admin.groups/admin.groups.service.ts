import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { IResponse } from 'src/model/dto/response.interface';
import { CAdminGroup } from "src/model/entities/admin.group";
import { IGetList } from "src/model/dto/getlist.interface";
import { CErrorsService } from "src/common/services/errors.service";

@Injectable()
export class CAdminGroupsService {
    constructor (
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CAdminGroup[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `groups.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.dataSource
                .getRepository(CAdminGroup)
                .createQueryBuilder("groups")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.dataSource
                .getRepository(CAdminGroup)
                .createQueryBuilder("groups")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CAdminGroupsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CAdminGroup>> {
        try {
            const data = await this.dataSource.getRepository(CAdminGroup).findOne({where: {id}});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "group not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CAdminGroupsService.one", err);
            return {statusCode: 500, error};
        }
    }

    ////////////////
    // utils
    ////////////////
    
    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.search) {
            filter += ` AND (LOWER(groups.name) LIKE LOWER('%${dtoFilter.search}%') OR groups.id = '${dtoFilter.search}')`;
        }

        return filter;
    }
}
