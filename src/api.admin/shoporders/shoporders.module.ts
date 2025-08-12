import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CShopordersController } from "./shoporders.controller";
import { CShopordersService } from "./shoporders.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],
    providers: [CShopordersService],
    controllers: [CShopordersController],
})
export class CShopordersModule {}
