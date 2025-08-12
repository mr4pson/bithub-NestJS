import { Controller, Post } from "@nestjs/common";
import { CArtcatsService } from "./artcats.service";
import { IResponse } from "src/model/dto/response.interface";
import { IArtcat } from "./dto/artcat.interface";

@Controller('api/mainsite/artcats')
export class CArtcatsController {
    constructor (private artcatsService: CArtcatsService) {}    
    
    @Post("all")
    public all(): Promise<IResponse<IArtcat[]>> {
        return this.artcatsService.all();
    }    
}
