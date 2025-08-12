import { Controller, Post } from "@nestjs/common";
import { CBaxersService } from "./baxers.service";
import { IResponse } from "src/model/dto/response.interface";
import { IBaxer } from "./dto/baxer.interface";

@Controller('api/mainsite/baxers')
export class CBaxersController {
    constructor (private baxersService: CBaxersService) {}    
    
    @Post("all")
    public all(): Promise<IResponse<IBaxer[]>> {
        return this.baxersService.all();
    }    
}
