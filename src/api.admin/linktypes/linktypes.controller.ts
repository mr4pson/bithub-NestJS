import { Controller, Param, Post, Body, UseGuards, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CLinktypesService } from "./linktypes.service";
import { CLinktype } from "src/model/entities/linktype";
import { IGetList } from "src/model/dto/getlist.interface";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CAdminGuard } from "src/common/services/guards/admin.guard";

@Controller('api/admin/linktypes')
export class CLinktypesController {
    constructor (private linktypesService: CLinktypesService) {}        
    
    @UseGuards(CAdminGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CLinktype[]>> {
        return this.linktypesService.chunk(dto);
    }
    
    @UseGuards(CAdminGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CLinktype>> {
        return this.linktypesService.one(parseInt(id));
    }
    
    @UseGuards(CAdminGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.linktypesService.delete(parseInt(id));
    }

    @UseGuards(CAdminGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.linktypesService.deleteBulk(ids);
    }
    
    @UseGuards(CAdminGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("create")
    public create(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CLinktype>> {
        return this.linktypesService.create(fd, uploads);
    }
    
    @UseGuards(CAdminGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("update")
    public update(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CLinktype>> {
        return this.linktypesService.update(fd, uploads);
    }
}
