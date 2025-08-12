import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CLangsController } from "./langs.controller";
import { CLangsService } from "./langs.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CLangsService],
    controllers: [CLangsController],
})
export class CLangsModule {}
