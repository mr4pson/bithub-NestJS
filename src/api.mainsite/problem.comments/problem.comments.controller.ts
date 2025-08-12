import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { JwtService } from "@nestjs/jwt";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { IGetList } from "src/model/dto/getlist.interface";
import { CProblemCommentsService } from "./problem.comments.service";
import { IProblemComment } from "./dto/problem.comment.interface";
import { IProblemCommentCreate } from "./dto/problem.comment.create";

@Controller('api/mainsite/problem-comments')
export class CProblemCommentsController {
    constructor(
        private commentsService: CProblemCommentsService,
        private jwtService: JwtService,
    ) {}        
    
    @UseGuards(CUserGuard)
    @Post("create")
    public create(@Body() dto: IProblemCommentCreate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.commentsService.create(dto, visitor_id);
    }
    
    @UseGuards(CUserGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList, @Req() request: Request): Promise<IResponse<IProblemComment[]>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.commentsService.chunk(dto, visitor_id);
    }
}
