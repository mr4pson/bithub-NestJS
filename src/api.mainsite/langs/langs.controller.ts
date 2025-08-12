import { Controller, Post } from "@nestjs/common";
import { CLangsService } from "./langs.service";
import { IResponse } from "src/model/dto/response.interface";
import { ILang } from "./dto/lang.interface";

@Controller('api/mainsite/langs')
export class CLangsController {
    constructor (private langsService: CLangsService) {}    
    
    @Post("all")
    public all(): Promise<IResponse<ILang[]>> {
        return this.langsService.all();
    }    
}
