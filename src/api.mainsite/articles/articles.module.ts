import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CArticlesController } from "./articles.controller";
import { CArticlesService } from "./articles.service";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],    
    providers: [CArticlesService],
    controllers: [CArticlesController],
})
export class CArticlesModule {}
