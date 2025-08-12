import { Controller, Param, Post, Body, UseGuards, UseInterceptors, UploadedFiles, Req } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CAdminsService } from "./admins.service";
import { CAdmin } from "src/model/entities/admin";
import { COwnerGuard } from "src/common/services/guards/owner.guard";
import { IGetList } from "src/model/dto/getlist.interface";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { IAdminLogin } from "src/model/dto/admin.login.interface";
import { IAdminAuthData } from "src/model/dto/admin.authdata.interface";
import { IAdminVerify } from "src/model/dto/admin.verify.interface";
import { IAdminRecovery } from "src/model/dto/admin.recovery.interface";
import { JwtService } from "@nestjs/jwt";
import { CAdminGuard } from "src/common/services/guards/admin.guard";

@Controller('api/admin/admins')
export class CAdminsController {
    constructor (
        private adminsService: CAdminsService,
        private jwtService: JwtService,
    ) {}    
    
    @UseGuards(COwnerGuard)
    @Post("chunk")
    public chunk(@Body() dto: IGetList): Promise<IResponse<CAdmin[]>> {
        return this.adminsService.chunk(dto);
    }

    @UseGuards(COwnerGuard)
    @Post("one/:id")
    public one(@Param("id") id: string): Promise<IResponse<CAdmin>> {
        return this.adminsService.one(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete/:id")
    public delete(@Param("id") id: string): Promise<IResponse<void>> {
        return this.adminsService.delete(parseInt(id));
    }

    @UseGuards(COwnerGuard)
    @Post("delete-bulk")
    public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
        return this.adminsService.deleteBulk(ids);
    }

    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("create")
    public create(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CAdmin>> {
        return this.adminsService.create(fd, uploads);
    }

    @UseGuards(COwnerGuard)
    @UseInterceptors(AnyFilesInterceptor({limits: {fieldSize: 1000 * 1024 * 1024}}))
    @Post("update")
    public update(@Body() fd: IJsonFormData, @UploadedFiles() uploads: Express.Multer.File[]): Promise<IResponse<CAdmin>> {
        return this.adminsService.update(fd, uploads);
    }

    @Post("login")
    public login(@Body() dto: IAdminLogin): Promise<IResponse<IAdminAuthData>> {
        return this.adminsService.login(dto);
    } 

    @Post("verify")
    public verify(@Body() dto: IAdminVerify): Promise<IResponse<void>> {
        return this.adminsService.verify(dto);
    }

    @Post("recover")
    public recover(@Body() dto: IAdminRecovery): Promise<IResponse<void>> {
        return this.adminsService.recover(dto);
    }    

    @UseGuards(CAdminGuard)
    @Post("me")
    public me(@Req() request: Request): Promise<IResponse<CAdmin>> {
        const id = this.jwtService.decode(request.headers["token"] as string)["id"] as number;
        return this.adminsService.one(id);
    }
}
