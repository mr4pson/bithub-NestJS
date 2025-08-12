import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CPromocodesController } from "./promocodes.controller";
import { CPromocodesService } from "./promocodes.service";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CPromocodesService],
    controllers: [CPromocodesController],
    exports: [CPromocodesService],
})
export class CPromocodesModule {}
