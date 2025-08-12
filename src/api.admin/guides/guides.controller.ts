import { Controller, Param, Post, Body, UseGuards, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CGuidesService } from "./guides.service";
import { CGuide } from "src/model/entities/guide";
import { IGetList } from "src/model/dto/getlist.interface";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CAdminGuard } from "src/common/services/guards/admin.guard";

@Controller('api/admin/guides')
export class CGuidesController {
    constructor (private guidesService: CGuidesService) {}        
    
    @UseGuards(CAdminGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CGuide[]>> {
        return this.guidesService.chunk(dto);
    }
    
    @UseGuards(CAdminGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CGuide>> {
        return this.guidesService.one(parseInt(id));
    }
    
    @UseGuards(CAdminGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.guidesService.delete(parseInt(id));
    }

    @UseGuards(CAdminGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.guidesService.deleteBulk(ids);
    }
    
    @UseGuards(CAdminGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("create")
    public create(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CGuide>> {
        return this.guidesService.create(fd, uploads);
    }
    
    @UseGuards(CAdminGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("update")
    public update(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CGuide>> {
        return this.guidesService.update(fd, uploads);
    }
}
