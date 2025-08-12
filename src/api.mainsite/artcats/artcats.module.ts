import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CArtcatsController } from "./artcats.controller";
import { CArtcatsService } from "./artcats.service";

@Module({
    imports: [CCommonModule],    
    providers: [CArtcatsService],
    controllers: [CArtcatsController],
})
export class CArtcatsModule {}
