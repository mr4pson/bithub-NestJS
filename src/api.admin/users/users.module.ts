import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { CUsersController } from "./users.controller";
import { CUsersService } from "./users.service";
import { cfg } from "src/app.config";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CUsersService],
    controllers: [CUsersController],
})
export class CUsersModule {}
