import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CDatemarksService } from "./datemarks.service";
import { CDatemarksController } from "./datemarks.controller";

@Module({
    imports: [
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],
    providers: [CDatemarksService],
    controllers: [CDatemarksController],
})
export class CDatemarksModule {}
