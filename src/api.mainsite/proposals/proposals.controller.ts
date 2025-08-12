import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { CProposalsService } from "./proposals.service";
import { JwtService } from "@nestjs/jwt";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { IResponse } from "src/model/dto/response.interface";
import { IProposalCreate } from "./dto/proposal.create.interface";

@Controller('api/mainsite/proposals')
export class CProposalsController {
    constructor (
        private proposalsService: CProposalsService,
        private jwtService: JwtService,
    ) {}  

    @UseGuards(CUserGuard)
    @Post("create")
    public create(@Body() dto: IProposalCreate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.proposalsService.create(dto, visitor_id);
    }
}
