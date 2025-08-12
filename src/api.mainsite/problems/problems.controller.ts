import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { CProblemsService } from "./problems.service";
import { JwtService } from "@nestjs/jwt";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { IProblemCreate } from "./dto/problem.create.interface";
import { IResponse } from "src/model/dto/response.interface";
import { IProblem } from "./dto/problem.interface";
import { IProblemUpdate } from "./dto/problem.update.interface";
import { IProblemUpdateDesk } from "./dto/problem.update.desk.interface";

@Controller('api/mainsite/problems')
export class CProblemsController {
    constructor (
        private problemsService: CProblemsService,
        private jwtService: JwtService,
    ) {}  

    @UseGuards(CUserGuard)
    @Post("create")
    public create(@Body() dto: IProblemCreate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.problemsService.create(dto, visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("update")
    public update(@Body() dto: IProblemUpdate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.problemsService.update(dto, visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("one-viewable/:id")
    public oneViewable(@Param("id") id: string, @Req() request: Request): Promise<IResponse<IProblem>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.problemsService.oneViewable(parseInt(id), visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("one-editable/:id")
    public oneEditable(@Param("id") id: string, @Req() request: Request): Promise<IResponse<IProblem>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.problemsService.oneEditable(parseInt(id), visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.problemsService.delete(parseInt(id), visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("update-viewing/:id")
    public updateViewing(@Param("id") id: string, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.problemsService.updateViewing(parseInt(id), visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("update-desk")
    public updateDesk(@Body() dto: IProblemUpdateDesk, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.problemsService.updateDesk(dto, visitor_id);
    }
}
