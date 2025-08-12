import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { CCommentsService } from "./comments.service";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { IComment } from "./dto/comment.interface";
import { ICommentCreate } from "./dto/comment.create.interface";
import { JwtService } from "@nestjs/jwt";

@Controller('api/mainsite/comments')
export class CCommentsController {
    constructor(
        private commentsService: CCommentsService,
        private jwtService: JwtService,
    ) {}

    @UseGuards(CUserGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList, @Req() request: Request): Promise<IResponse<IComment[]>> {
        const tz = parseInt(request.headers["tz"]);
        return this.commentsService.chunk(dto, tz);
    }

    @UseGuards(CUserGuard)
    @Post("create")
    public create(@Body() dto: ICommentCreate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"];
        return this.commentsService.create(visitor_id, dto);
    }
}
