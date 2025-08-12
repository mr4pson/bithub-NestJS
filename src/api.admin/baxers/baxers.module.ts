import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CBaxersController } from "./baxers.controller";
import { CBaxersService } from "./baxers.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CBaxersService],
    controllers: [CBaxersController],
})
export class CBaxersModule {}
