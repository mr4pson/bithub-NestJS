import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { CShopordersService } from "./shoporders.service";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { IShoporderCreate } from "./dto/shoporder.create.interface";
import { IResponse } from "src/model/dto/response.interface";
import { JwtService } from "@nestjs/jwt";

@Controller('api/mainsite/shoporders')
export class CShopordersController {
    constructor (
        private shopordersService: CShopordersService,
        private jwtService: JwtService,
    ) {}

    @UseGuards(CUserGuard)
    @Post("create")
    public create(@Body() dto: IShoporderCreate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const user_id = this.jwtService.decode(token)["id"];
        return this.shopordersService.create(user_id, dto);
    }
}
