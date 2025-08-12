import { Controller, Post, UseGuards } from "@nestjs/common";
import { CShopcatsService } from "./shopcats.service";
import { IResponse } from "src/model/dto/response.interface";
import { IShopcat } from "./dto/shopcat.interface";
import { CUserGuard } from "src/common/services/guards/user.guard";

@Controller('api/mainsite/shopcats')
export class CShopcatsController {
    constructor (private shopcatsService: CShopcatsService) {}

    @UseGuards(CUserGuard)
    @Post("all")
    public all(): Promise<IResponse<IShopcat[]>> {
        return this.shopcatsService.all();
    }
}
