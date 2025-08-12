import { Controller, Param, Post, Body, UseGuards } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CBackupsService } from "./backups.service";
import { CBackup } from "src/model/entities/backup";
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { IGetList } from "src/model/dto/getlist.interface";

@Controller('api/admin/backups')
export class CBackupsController {
    constructor (private backupsService: CBackupsService) {}        
    
    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CBackup[]>> {
        return this.backupsService.chunk(dto);
    }
    
    @UseGuards(COwnerGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.backupsService.delete(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.backupsService.deleteBulk(ids);
    }
    
    @UseGuards(COwnerGuard)
    @Post("create")
    public create(): Promise<IResponse<void>> {
        return this.backupsService.create();
    }
}
