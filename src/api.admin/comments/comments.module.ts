import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CCommentsController } from "./comments.controller";
import { CCommentsService } from "./comments.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],
    providers: [CCommentsService],
    controllers: [CCommentsController],
})
export class CCommentsModule {}
