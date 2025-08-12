import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CCommentsController } from "./comments.controller";
import { CCommentsService } from "./comments.service";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],
    providers: [CCommentsService],
    controllers: [CCommentsController],
})
export class CCommentsModule {}
