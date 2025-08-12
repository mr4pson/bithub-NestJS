import { Controller, Post, Body, UseGuards, Param } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CAdminGroupsService } from "./admin.groups.service";
import { CAdminGroup } from "src/model/entities/admin.group";
import { IGetList } from "src/model/dto/getlist.interface";
import { COwnerGuard } from "src/common/services/guards/owner.guard";

@Controller('api/admin/admingroups')
export class CAdminGroupsController {
    constructor (private adminGroupsService: CAdminGroupsService) {}
    
    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CAdminGroup[]>> {
        return this.adminGroupsService.chunk(dto);
    }

    @UseGuards(COwnerGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CAdminGroup>> {
        return this.adminGroupsService.one(parseInt(id));
    }
}
