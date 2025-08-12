import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CDesksController } from "./desks.controller";
import { CDesksService } from "./desks.service";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        JwtModule.register(cfg.jwtUser),
        CCommonModule,
    ],    
    providers: [CDesksService],
    controllers: [CDesksController],
})
export class CDesksModule {}
