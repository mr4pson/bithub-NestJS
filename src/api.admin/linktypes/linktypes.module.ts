import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CLinktypesController } from "./linktypes.controller";
import { CLinktypesService } from "./linktypes.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CLinktypesService],
    controllers: [CLinktypesController],
})
export class CLinktypesModule {}
