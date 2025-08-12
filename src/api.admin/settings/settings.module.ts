import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CSettingsController } from "./settings.controller";
import { CSettingsService } from "./settings.service";
import { CCommonModule } from "src/common/common.module";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CSettingsService],
    controllers: [CSettingsController],
})
export class CSettingsModule {}
