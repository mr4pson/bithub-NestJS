import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CWordbooksController } from "./wordbooks.controller";
import { CWordbooksService } from "./wordbooks.service";
import { CCommonModule } from "src/common/common.module";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CWordbooksService],
    controllers: [CWordbooksController],
})
export class CWordbooksModule {}
