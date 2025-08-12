import { Injectable } from "@nestjs/common";
import { CAppService } from "src/common/services/app.service";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CDatemark } from "src/model/entities/datemark";
import { DataSource } from "typeorm";
import { IDatemarkToggle } from "./dto/datemark.toggle.interface";
import { IDatemarkGetList } from "./dto/datemark.getlist.interface";

@Injectable()
export class CDatemarksService {
    constructor(
        protected errorsService: CErrorsService,
        protected appService: CAppService,
        protected dataSource: DataSource,
    ) {}

    public async all(dto: IDatemarkGetList, user_id: number): Promise<IResponse<number[]>> {
        try {
            const filter = this.buildFilter(dto, user_id);
            const datemarks = await this.dataSource
                .getRepository(CDatemark)
                .createQueryBuilder("datemarks")
                .where(filter)
                .orderBy({"datemarks.date": "ASC"})
                .getMany();
            const data = datemarks.map(d => this.appService.splitMysqlDate(d.date).day);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CDatemarksService.all", err);
            return {statusCode: 500, error};
        }
    }

    public async toggle(dto: IDatemarkToggle, user_id: number): Promise<IResponse<void>> {
        try {
            const partial = {user_id, guide_id: dto.guide_id, type: dto.type, date: dto.date};
            const datemark = await this.dataSource.getRepository(CDatemark).findOne({where: partial});
            const repo = this.dataSource.getRepository(CDatemark);
            datemark ? await repo.remove(datemark) : await repo.save(partial);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CDatemarksService.toggle", err);
            return {statusCode: 500, error};
        }
    }

    ////////////////
    // utils
    ////////////////

    private buildFilter(dto: IDatemarkGetList, user_id: number): string {
        const from = `${dto.year}-${this.appService.twoDigits(dto.month)}-01`;
        return `
            datemarks.user_id = '${user_id}' AND
            datemarks.guide_id = '${dto.guide_id}' AND
            datemarks.type = '${dto.type}' AND
            datemarks.date >= '${from}' AND
            datemarks.date < ('${from}' + INTERVAL 1 MONTH)
        `;
    }
}
