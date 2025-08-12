import { Controller, Param, Post, Body, UseGuards, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CLangsService } from "./langs.service";
import { CLang } from "src/model/entities/lang";
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { IGetList } from "src/model/dto/getlist.interface";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CAdminGuard } from "src/common/services/guards/admin.guard";

@Controller('api/admin/langs')
export class CLangsController {
    constructor (private langsService: CLangsService) {}    

    @UseGuards(CAdminGuard)
    @Post("all")
    public all(@Body() dto: IGetList): Promise<IResponse<CLang[]>> {
        return this.langsService.all(dto);
    }  

    @UseGuards(CAdminGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CLang[]>> {
        return this.langsService.chunk(dto);
    }

    @UseGuards(CAdminGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CLang>> {
        return this.langsService.one(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.langsService.delete(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.langsService.deleteBulk(ids);
    }

    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("create")
    public create(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CLang>> {
        return this.langsService.create(fd, uploads);
    }
    
    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("update")
    public update(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CLang>> {
        return this.langsService.update(fd, uploads);
    }
}
