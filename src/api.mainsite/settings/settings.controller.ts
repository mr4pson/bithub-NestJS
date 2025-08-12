import { Controller, Post } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { ISettings } from "./dto/settings.interface";
import { CSettingsService } from "./settings.service";

@Controller('api/mainsite/settings')
export class CSettingsController {
    constructor (private settingsService: CSettingsService) {}    
    
    @Post("all")
    public all(): Promise<IResponse<ISettings>> {
        return this.settingsService.all();
    }        
}
