import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CProposal } from "src/model/entities/proposal";
import { DataSource } from "typeorm";
import { IProposalCreate } from "./dto/proposal.create.interface";
import { CAdmin } from "src/model/entities/admin";
import { CMailService } from "src/common/services/mailable/mail.service";

@Injectable()
export class CProposalsService {
    constructor(
        private errorsService: CErrorsService,
        private mailService: CMailService,
        private dataSource: DataSource,
    ) {}

    public async create(dto: IProposalCreate, user_id: number): Promise<IResponse<void>> {
        try {
            const proposal = this.buildSafeCreate(dto, user_id);
            await this.dataSource.getRepository(CProposal).save(proposal);
            this.notifyOnCreate(proposal);
            return {statusCode: 201};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CProposalsService.create", err);
            return {statusCode: 500, error};
        }
    }

    ///////////////
    // utils
    ///////////////

    private buildSafeCreate(dto: IProposalCreate, user_id: number): CProposal {
        return this.dataSource.getRepository(CProposal).create({
            user_id, 
            content: dto.content,
        });
    }

    private async notifyOnCreate(proposal: CProposal): Promise<void> {
        try {
            const admins = await this.dataSource.getRepository(CAdmin).find({where: {active: true, hidden: false}});

            for (let admin of admins) {
                await this.mailService.adminProposal(admin.email, proposal);
            }
        } catch (err) {
            await this.errorsService.log("api.mainsite/CProposalsService.notifyOnCreate", err);
        }
    }
}