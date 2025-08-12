import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CAwardsController } from "./awards.controller";
import { CAwardsService } from "./awards.service";

@Module({
    imports: [CCommonModule],    
    providers: [CAwardsService],
    controllers: [CAwardsController],
    exports: [CAwardsService],
})
export class CAwardsModule {}
