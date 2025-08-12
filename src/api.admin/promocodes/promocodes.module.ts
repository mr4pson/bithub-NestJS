import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CPromocodesController } from "./promocodes.controller";
import { CPromocodesService } from "./promocodes.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CPromocodesService],
    controllers: [CPromocodesController],
})
export class CPromocodesModule {}
