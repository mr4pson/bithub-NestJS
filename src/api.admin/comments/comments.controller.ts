import { Controller, Param, Post, Body, UseGuards, UseInterceptors } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CCommentsService } from "./comments.service";
import { CComment } from "src/model/entities/comment";
import { IGetList } from "src/model/dto/getlist.interface";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { CAdminGuard } from "src/common/services/guards/admin.guard";

@Controller('api/admin/comments')
export class CCommentsController {
    constructor (private commentsService: CCommentsService) {}

    @UseGuards(CAdminGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CComment[]>> {
        return this.commentsService.chunk(dto);
    }

    @UseGuards(CAdminGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CComment>> {
        return this.commentsService.one(parseInt(id));
    }

    @UseGuards(CAdminGuard)
    @Post("one-with-user/:id")
    public oneWithUser(@Param("id") id: string): Promise<IResponse<CComment>> {
        return this.commentsService.oneWithUser(parseInt(id));
    }

    @UseGuards(CAdminGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.commentsService.delete(parseInt(id));
    }

    @UseGuards(CAdminGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.commentsService.deleteBulk(ids);
    }

    @UseGuards(CAdminGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("create")
    public create(@Body() fd: IJsonFormData): Promise<IResponse<CComment>> {
        return this.commentsService.create(fd);
    }

    @UseGuards(CAdminGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("update")
    public update(@Body() fd: IJsonFormData): Promise<IResponse<CComment>> {
        return this.commentsService.update(fd);
    }
}
