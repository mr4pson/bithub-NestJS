import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CAdminsController } from "./admins.controller";
import { CAdminsService } from "./admins.service";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CAdminsService],
    controllers: [CAdminsController],    
    exports: [CAdminsService],
})
export class CAdminsModule {}
