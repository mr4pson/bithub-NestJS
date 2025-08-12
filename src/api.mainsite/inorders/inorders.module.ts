import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CInordersService } from "./inorders.service";
import { CInordersController } from "./inorders.controller";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CSocketModule } from "src/socket/socket.module";

@Module({
    imports: [
        CCommonModule,
        CSocketModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CInordersService],
    controllers: [CInordersController],
})
export class CInordersModule {}
