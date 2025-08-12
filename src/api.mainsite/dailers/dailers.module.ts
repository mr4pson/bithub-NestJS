import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CDailersController } from "./dailers.controller";
import { CDailersService } from "./dailers.service";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        JwtModule.register(cfg.jwtUser),
        CCommonModule,
    ],    
    providers: [CDailersService],
    controllers: [CDailersController],
})
export class CDailersModule {}
