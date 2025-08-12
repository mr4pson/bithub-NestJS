import { Controller, Post } from "@nestjs/common";
import { CAwardsService } from "./awards.service";
import { IResponse } from "src/model/dto/response.interface";
import { IAward } from "./dto/award.interface";

@Controller('api/landing/awards')
export class CAwardsController {
    constructor (private awardsService: CAwardsService) {}    
    
    @Post("all")
    public all(): Promise<IResponse<IAward[]>> {
        return this.awardsService.all();
    }    
}
