import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CUserGuard } from "src/common/services/guards/user.guard";
import { COutordersService } from "./outorders.service";
import { JwtService } from "@nestjs/jwt";
import { IOutorderCreate } from "./dto/outorder.create.interface";

@Controller('api/mainsite/outorders')
export class COutordersController {
    constructor(
        private outordersService: COutordersService,
        private jwtService: JwtService,
    ) {}        

    @UseGuards(CUserGuard)
    @Post("create")
    public create(@Body() dto: IOutorderCreate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.outordersService.create(dto, visitor_id);
    }    
}
