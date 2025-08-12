import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CAdminGroupsService } from "./admin.groups.service";
import { CAdminGroupsController } from "./admin.groups.controller";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CAdminGroupsService],
    controllers: [CAdminGroupsController],
})
export class CAdminGroupsModule {}
