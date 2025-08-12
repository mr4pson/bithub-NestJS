import { Controller, Param, Post, Body, UseGuards, UseInterceptors } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CPromocodesService } from "./promocodes.service";
import { CPromocode } from "src/model/entities/promocode";
import { IGetList } from "src/model/dto/getlist.interface";
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { AnyFilesInterceptor } from "@nestjs/platform-express";

@Controller('api/admin/promocodes')
export class CPromocodesController {
    constructor (private promocodesService: CPromocodesService) {}        
    
    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CPromocode[]>> {
        return this.promocodesService.chunk(dto);
    }
    
    @UseGuards(COwnerGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CPromocode>> {
        return this.promocodesService.one(parseInt(id));
    }
    
    @UseGuards(COwnerGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.promocodesService.delete(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.promocodesService.deleteBulk(ids);
    }
    
    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("create")
    public create(@Body() fd: IJsonFormData): Promise<IResponse<CPromocode>> {
        return this.promocodesService.create(fd);
    }
    
    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("update")
    public update(@Body() fd: IJsonFormData): Promise<IResponse<CPromocode>> {
        return this.promocodesService.update(fd);
    }
}
