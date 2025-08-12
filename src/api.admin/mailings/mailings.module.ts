import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CMailingsController } from "./mailings.controller";
import { CMailingsService } from "./mailings.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],
    providers: [CMailingsService],
    controllers: [CMailingsController],
})
export class CMailingsModule {}
