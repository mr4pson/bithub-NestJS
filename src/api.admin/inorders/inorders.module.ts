import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CInordersController } from "./inorders.controller";
import { CInordersService } from "./inorders.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CInordersService],
    controllers: [CInordersController],
})
export class CInordersModule {}
