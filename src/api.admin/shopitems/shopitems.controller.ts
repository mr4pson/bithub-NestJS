import { Controller, Param, Post, Body, UseGuards, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CShopitemsService } from "./shopitems.service";
import { CShopitem } from "src/model/entities/shopitem";
import { IGetList } from "src/model/dto/getlist.interface";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CAdminGuard } from "src/common/services/guards/admin.guard";

@Controller('api/admin/shopitems')
export class CShopitemsController {
    constructor (private shopitemsService: CShopitemsService) {}

    @UseGuards(CAdminGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CShopitem[]>> {
        return this.shopitemsService.chunk(dto);
    }

    @UseGuards(CAdminGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CShopitem>> {
        return this.shopitemsService.one(parseInt(id));
    }

    @UseGuards(CAdminGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.shopitemsService.delete(parseInt(id));
    }

    @UseGuards(CAdminGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.shopitemsService.deleteBulk(ids);
    }

    @UseGuards(CAdminGuard)
    @Post("archive/:id")
    public archive(@Param("id") id: string): Promise<IResponse<void>> {
        return this.shopitemsService.archive(parseInt(id));
    }

    @UseGuards(CAdminGuard)
    @Post("archive-bulk")
    public archiveBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.shopitemsService.archiveBulk(ids);
    }

    @UseGuards(CAdminGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("create")
    public create(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CShopitem>> {
        return this.shopitemsService.create(fd, uploads);
    }

    @UseGuards(CAdminGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("update")
    public update(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CShopitem>> {
        return this.shopitemsService.update(fd, uploads);
    }
}
