import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CBackupsController } from "./backups.controller";
import { CBackupsService } from "./backups.service";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CBackupsService],
    controllers: [CBackupsController],
    exports: [CBackupsService]
})
export class CBackupsModule {}
