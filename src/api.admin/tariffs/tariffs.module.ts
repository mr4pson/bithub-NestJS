import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CTariffsController } from "./tariffs.controller";
import { CTariffsService } from "./tariffs.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CTariffsService],
    controllers: [CTariffsController],
})
export class CTariffsModule {}
