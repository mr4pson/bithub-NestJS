import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CShopordersController } from "./shoporders.controller";
import { CShopordersService } from "./shoporders.service";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],
    providers: [CShopordersService],
    controllers: [CShopordersController],
})
export class CShopordersModule {}
