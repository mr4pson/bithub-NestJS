import { Controller, Param, Post, Body, UseGuards, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CSettingsService } from "./settings.service";
import { CSetting } from "src/model/entities/setting";
import { ISettingCreate } from "./dto/setting.create.interface";
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { IGetList } from "src/model/dto/getlist.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { AnyFilesInterceptor } from "@nestjs/platform-express";

@Controller('api/admin/settings')
export class CSettingsController {
    constructor (private settingsService: CSettingsService) {}    

    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CSetting[]>> {
        return this.settingsService.chunk(dto);
    }
    
    @UseGuards(COwnerGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.settingsService.delete(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.settingsService.deleteBulk(ids);
    }

    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("create")
    public create(@Body() fd: IJsonFormData): Promise<IResponse<CSetting>> {
        return this.settingsService.create(fd);
    }
}
