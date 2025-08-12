import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { CDailersService } from "./dailers.service";
import { JwtService } from "@nestjs/jwt";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { IResponse } from "src/model/dto/response.interface";
import { IDailer } from "./dto/dailer";
import { IDailerSave } from "./dto/dailer.save";
import { IGetList } from "src/model/dto/getlist.interface";

@Controller('api/mainsite/dailers')
export class CDailersController {
    constructor (
        private dailersService: CDailersService,
        private jwtService: JwtService,
    ) {}  

    @UseGuards(CUserGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList, @Req() request: Request): Promise<IResponse<IDailer[]>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.dailersService.chunk(dto, visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("save")
    public save(@Body() dto: IDailerSave, @Req() request: Request): Promise<IResponse<IDailer>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.dailersService.save(dto, visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.dailersService.delete(parseInt(id), visitor_id);
    }
}
