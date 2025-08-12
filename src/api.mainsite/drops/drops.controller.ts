import { Body, Controller, Post } from "@nestjs/common";
import { CDropsService } from "./drops.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { IDrop } from "./dto/drop.interface";

@Controller('api/mainsite/drops')
export class CDropsController {
    constructor (private dropsService: CDropsService) {}

    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<IDrop[]>> {
        return this.dropsService.chunk(dto);
    }
}
