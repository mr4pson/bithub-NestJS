import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CSettingsController } from "./settings.controller";
import { CSettingsService } from "./settings.service";

@Module({
    imports: [CCommonModule],    
    providers: [CSettingsService],
    controllers: [CSettingsController],
})
export class CSettingsModule {}
