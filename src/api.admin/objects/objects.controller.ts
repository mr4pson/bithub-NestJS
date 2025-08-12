import { Controller, Post, Body, UseGuards } from "@nestjs/common";

import { CObjectsService } from "./objects.service";
import { IResponse } from 'src/model/dto/response.interface';
import { IUpdateParam } from "src/model/dto/updateparam.interface";
import { CAdminGuard } from "src/common/services/guards/admin.guard";

@Controller('api/admin/objects')
export class CObjectsController {
    constructor (private objectsService: CObjectsService) {}

    // update parameter of any object    
    @UseGuards(CAdminGuard)
    @Post("update-param")    
    public updateParam (@Body() dto: IUpdateParam): Promise<IResponse<void>> {
        return this.objectsService.updateParam(dto);
    }

    // update "egoistic" parameter of any object ("egoistic" means that only one can be true in table)   
    @UseGuards(CAdminGuard)
    @Post("update-egoistic-param")    
    public updateEgoisticParam (@Body() dto: IUpdateParam): Promise<IResponse<void>> {
        return this.objectsService.updateEgoisticParam(dto);
    }   
}
