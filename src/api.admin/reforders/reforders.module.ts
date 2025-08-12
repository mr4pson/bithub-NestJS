import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CRefordersController } from "./reforders.controller";
import { CRefordersService } from "./reforders.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CRefordersService],
    controllers: [CRefordersController],
})
export class CRefordersModule {}
