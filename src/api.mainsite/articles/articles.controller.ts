import { Controller, Post, Body, Req, UseGuards, Param } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CArticlesService } from "./articles.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IArticle } from "./dto/article.interface";
import { JwtService } from "@nestjs/jwt";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { IReadingUpdate } from "./dto/reading.update.interface";

@Controller('api/mainsite/articles')
export class CArticlesController {
    constructor (
        private articlesService: CArticlesService,
        private jwtService: JwtService,
    ) {}        
    
    @Post("chunk")
    public chunk(@Body() dto: IGetList, @Req() request: Request): Promise<IResponse<IArticle[]>> {
        const token = request.headers["token"] as string;
        const visitor_id = token ? this.jwtService.decode(token)["id"] as number : null;
        return this.articlesService.chunk(dto, visitor_id);
    }

    @Post("one/:slug")
    public one(@Param("slug") slug: string, @Req() request: Request): Promise<IResponse<IArticle>> {
        const token = request.headers["token"] as string;
        const visitor_id = token ? this.jwtService.decode(token)["id"] as number : null;
        return this.articlesService.one(slug, visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("update-reading")
    public updateReading(@Body() dto: IReadingUpdate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.articlesService.updateReading(dto, visitor_id);
    }
}
