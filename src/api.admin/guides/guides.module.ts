import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { CGuidesController } from "./guides.controller";
import { CGuidesService } from "./guides.service";
import { cfg } from "src/app.config";
import { CSocketModule } from "src/socket/socket.module";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
        CSocketModule,
    ],    
    providers: [CGuidesService],
    controllers: [CGuidesController],
})
export class CGuidesModule {}
