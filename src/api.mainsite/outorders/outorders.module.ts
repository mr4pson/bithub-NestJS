import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { COutordersService } from "./outorders.service";
import { COutordersController } from "./outorders.controller";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CPromocodesModule } from "../promocodes/promocodes.module";

@Module({
    imports: [        
        JwtModule.register(cfg.jwtUser),
        CCommonModule,
        CPromocodesModule,
    ],    
    providers: [COutordersService],
    controllers: [COutordersController],
})
export class COutordersModule {}
