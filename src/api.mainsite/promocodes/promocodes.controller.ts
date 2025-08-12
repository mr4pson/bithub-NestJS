import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { CPromocodesService } from "./promocodes.service";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { IResponse } from "src/model/dto/response.interface";
import { IPromocode } from "./dto/promocode.interface";

@Controller('api/mainsite/promocodes')
export class CPromocodesController {
    constructor (private promocodesService: CPromocodesService) {}  

    @UseGuards(CUserGuard)
    @Post("one/:code")
    public one(@Param("code") code: string): Promise<IResponse<IPromocode>> {
        return this.promocodesService.one(code);
    }
}
