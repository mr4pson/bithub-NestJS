import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { CAwardsController } from "./awards.controller";
import { CAwardsService } from "./awards.service";
import { cfg } from "src/app.config";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CAwardsService],
    controllers: [CAwardsController],
})
export class CAwardsModule {}
