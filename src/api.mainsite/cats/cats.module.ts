import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CCatsController } from "./cats.controller";
import { CCatsService } from "./cats.service";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CUsersModule } from "../users/users.module";

@Module({
    imports: [
        JwtModule.register(cfg.jwtUser),
        CCommonModule,
        CUsersModule,
    ],
    providers: [CCatsService],
    controllers: [CCatsController],
})
export class CCatsModule {}
