import { Controller, Post, Req } from "@nestjs/common";
import { CCatsService } from "./cats.service";
import { IResponse } from "src/model/dto/response.interface";
import { ICat } from "./dto/cat.interface";
import { JwtService } from "@nestjs/jwt";

@Controller('api/mainsite/cats')
export class CCatsController {
    constructor (
        private jwtService: JwtService,
        private catsService: CCatsService,
    ) {}

    @Post("all")
    public all(@Req() request: Request): Promise<IResponse<ICat[]>> {
        const token = request.headers["token"] as string;
        const visitor_id = token ? this.jwtService.decode(token)["id"] as number : null;
        return this.catsService.all(visitor_id);
    }
}
