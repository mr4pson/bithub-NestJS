import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CShopcatsController } from "./shopcats.controller";
import { CShopcatsService } from "./shopcats.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],
    providers: [CShopcatsService],
    controllers: [CShopcatsController],
})
export class CShopcatsModule {}
