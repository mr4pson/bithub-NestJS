import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CDropsController } from "./drops.controller";
import { CDropsService } from "./drops.service";

@Module({
    imports: [CCommonModule],
    providers: [CDropsService],
    controllers: [CDropsController],
})
export class CDropsModule {}
