import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { CArticlesController } from "./articles.controller";
import { CArticlesService } from "./articles.service";
import { cfg } from "src/app.config";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CArticlesService],
    controllers: [CArticlesController],
})
export class CArticlesModule {}
