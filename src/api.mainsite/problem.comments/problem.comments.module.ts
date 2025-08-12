import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CProblemCommentsService } from "./problem.comments.service";
import { CProblemCommentsController } from "./problem.comments.controller";
import { CSocketModule } from "src/socket/socket.module";

@Module({
    imports: [
        JwtModule.register(cfg.jwtUser),
        CCommonModule,
        CSocketModule,        
    ],    
    providers: [CProblemCommentsService],
    controllers: [CProblemCommentsController],
})
export class CProblemCommentsModule {}
