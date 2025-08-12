import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CTasksController } from "./tasks.controller";
import { CTasksService } from "./tasks.service";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CSocketModule } from "src/socket/socket.module";
import { CUsersModule } from "../users/users.module";

@Module({
    imports: [
        JwtModule.register(cfg.jwtUser),
        CCommonModule,
        CSocketModule,
        CUsersModule,
    ],
    providers: [CTasksService],
    controllers: [CTasksController],
})
export class CTasksModule {}
