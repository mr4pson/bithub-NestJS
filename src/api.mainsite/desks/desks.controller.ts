import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { CDesksService } from "./desks.service";
import { JwtService } from "@nestjs/jwt";
import { IResponse } from "src/model/dto/response.interface";
import { IDesk } from "./dto/desk.interface";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { TDeskMode } from "src/model/entities/desk";

@Controller('api/mainsite/desks')
export class CDesksController {
    constructor (
        private desksService: CDesksService,
        private jwtService: JwtService,
    ) {}        
    
    @UseGuards(CUserGuard)
    @Post("all/:mode")
    public all(@Param("mode") mode: TDeskMode, @Req() request: Request): Promise<IResponse<IDesk[]>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.desksService.all(mode, visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("update")
    public update(@Body() dto: IDesk, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.desksService.update(dto, visitor_id);
    }
    
    @UseGuards(CUserGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.desksService.delete(parseInt(id), visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("create/:mode")
    public create(@Param("mode") mode: TDeskMode, @Req() request: Request): Promise<IResponse<IDesk>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.desksService.create(mode, visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("one/:id")
    public one(@Param("id") id: string, @Req() request: Request): Promise<IResponse<IDesk>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.desksService.one(parseInt(id), visitor_id);
    }
}
