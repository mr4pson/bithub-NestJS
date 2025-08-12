import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CCommonModule } from "src/common/common.module";
import { CStatsService } from "./stats.service";
import { CStatsController } from "./stats.controller";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CStatsService],
    controllers: [CStatsController],
})
export class CStatsModule {}
