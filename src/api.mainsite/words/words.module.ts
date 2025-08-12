import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CWordsController } from "./words.controller";
import { CWordsService } from "./words.service";

@Module({
    imports: [CCommonModule],    
    providers: [CWordsService],
    controllers: [CWordsController],
})
export class CWordsModule {}
