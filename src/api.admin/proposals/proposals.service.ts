import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { IResponse } from "src/model/dto/response.interface";
import { CProposal } from "src/model/entities/proposal";
import { DataSource } from "typeorm";
import { IProposalUpdate } from "./dto/proposal.update.interface";

@Injectable()
export class CProposalsService {
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CProposal[]>> {
        try {            
            const filter = this.buildFilter(dto.filter);
            const sortBy = `proposals.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const data = await this.dataSource
                .getRepository(CProposal)
                .createQueryBuilder("proposals")
                .leftJoinAndSelect("proposals.user", "user")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.dataSource
                .getRepository(CProposal)
                .createQueryBuilder("proposals")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CProposalsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CProposal>> {
        try {
            const data = await this.dataSource.getRepository(CProposal).findOne({where: {id}});
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "proposal not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CProposalsService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            await this.dataSource.getRepository(CProposal).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CProposalsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {            
            await this.dataSource.getRepository(CProposal).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CProposalsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async update(fd: IJsonFormData): Promise<IResponse<CProposal>> {
        try {
            const dto = JSON.parse(fd.data) as IProposalUpdate;
            const x = this.dataSource.getRepository(CProposal).create(dto);
            await this.dataSource.getRepository(CProposal).save(x);            
            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CProposalsService.update", err);
            return {statusCode: 500, error};
        } 
    }

    ///////////////
    // utils
    ///////////////

    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.user_id !== undefined) {
            if (dtoFilter.user_id === null) {
                filter += ` AND proposals.user_id IS NULL`;
            } else {
                filter += ` AND proposals.user_id = '${dtoFilter.user_id}'`;
            }
        }

        return filter;
    }
}
