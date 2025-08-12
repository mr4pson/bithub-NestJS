import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CShopcatsController } from "./shopcats.controller";
import { CShopcatsService } from "./shopcats.service";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],
    providers: [CShopcatsService],
    controllers: [CShopcatsController],
})
export class CShopcatsModule {}
