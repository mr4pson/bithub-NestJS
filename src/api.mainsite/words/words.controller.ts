import { Controller, Param, Post } from "@nestjs/common";
import { IResponse } from "src/model/dto/response.interface";
import { IWords } from "./dto/words.interface";
import { CWordsService } from "./words.service";

@Controller('api/mainsite/words')
export class CWordsController {
    constructor (private wordsService: CWordsService) {}    
    
    @Post("all")
    public all(): Promise<IResponse<IWords>> {
        return this.wordsService.all();
    }    
}
