import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CLangsController } from "./langs.controller";
import { CLangsService } from "./langs.service";

@Module({
    imports: [CCommonModule],    
    providers: [CLangsService],
    controllers: [CLangsController],
})
export class CLangsModule {}
