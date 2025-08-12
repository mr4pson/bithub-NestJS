import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { CDropsController } from "./drops.controller";
import { CDropsService } from "./drops.service";
import { cfg } from "src/app.config";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],
    providers: [CDropsService],
    controllers: [CDropsController],
})
export class CDropsModule {}
