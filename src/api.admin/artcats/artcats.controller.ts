import { Controller, Param, Post, Body, UseGuards, UseInterceptors } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CArtcatsService } from "./artcats.service";
import { CArtcat } from "src/model/entities/artcat";
import { IGetList } from "src/model/dto/getlist.interface";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CAdminGuard } from "src/common/services/guards/admin.guard";

@Controller('api/admin/artcats')
export class CArtcatsController {
    constructor (private artcatsService: CArtcatsService) {}        
    
    @UseGuards(CAdminGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CArtcat[]>> {
        return this.artcatsService.chunk(dto);
    }
    
    @UseGuards(CAdminGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CArtcat>> {
        return this.artcatsService.one(parseInt(id));
    }
    
    @UseGuards(CAdminGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.artcatsService.delete(parseInt(id));
    }

    @UseGuards(CAdminGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.artcatsService.deleteBulk(ids);
    }
    
    @UseGuards(CAdminGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("create")
    public create(@Body() fd: IJsonFormData): Promise<IResponse<CArtcat>> {
        return this.artcatsService.create(fd);
    }
    
    @UseGuards(CAdminGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("update")
    public update(@Body() fd: IJsonFormData): Promise<IResponse<CArtcat>> {
        return this.artcatsService.update(fd);
    }
}
