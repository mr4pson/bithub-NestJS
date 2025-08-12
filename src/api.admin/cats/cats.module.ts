import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CCatsController } from "./cats.controller";
import { CCatsService } from "./cats.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CCatsService],
    controllers: [CCatsController],
})
export class CCatsModule {}
