import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { CDatemarksService } from "./datemarks.service";
import { JwtService } from "@nestjs/jwt";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { IDatemarkToggle } from "./dto/datemark.toggle.interface";
import { IDatemarkGetList } from "./dto/datemark.getlist.interface";

@Controller('api/mainsite/datemarks')
export class CDatemarksController {
    constructor (
        private datemarksService: CDatemarksService,
        private jwtService: JwtService,
    ) {}

    @UseGuards(CUserGuard)
    @Post("all")
    public all(@Body() dto: IDatemarkGetList, @Req() request: Request): Promise<IResponse<number[]>> {
        const token = request.headers["token"] as string;
        const visitor_id = token ? this.jwtService.decode(token)["id"] as number : null;
        return this.datemarksService.all(dto, visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("toggle")
    public toggle(@Body() dto: IDatemarkToggle, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.datemarksService.toggle(dto, visitor_id);
    }
}
