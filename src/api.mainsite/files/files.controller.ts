import { Controller, Post } from "@nestjs/common";
import { IResponse } from "src/model/dto/response.interface";
import { IFiles } from "./dto/files.interface";
import { CFilesService } from "./files.service";

@Controller('api/mainsite/files')
export class CFilesController {
    constructor (private filesService: CFilesService) {}    
    
    @Post("all")
    public all(): Promise<IResponse<IFiles>> {
        return this.filesService.all();
    }    
}
