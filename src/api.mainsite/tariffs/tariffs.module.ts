import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CTariffsController } from "./tariffs.controller";
import { CTariffsService } from "./tariffs.service";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CTariffsService],
    controllers: [CTariffsController],
})
export class CTariffsModule {}
