import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { COutordersController } from "./outorders.controller";
import { COutordersService } from "./outorders.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [COutordersService],
    controllers: [COutordersController],
})
export class COutordersModule {}
