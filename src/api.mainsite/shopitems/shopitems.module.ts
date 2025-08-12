import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CShopitemsController } from "./shopitems.controller";
import { CShopitemsService } from "./shopitems.service";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        CCommonModule,
        JwtModule.register(cfg.jwtUser),
    ],
    providers: [CShopitemsService],
    controllers: [CShopitemsController],
})
export class CShopitemsModule {}
