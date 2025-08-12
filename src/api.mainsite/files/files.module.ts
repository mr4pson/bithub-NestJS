import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CFilesController } from "./files.controller";
import { CFilesService } from "./files.service";

@Module({
    imports: [CCommonModule],    
    providers: [CFilesService],
    controllers: [CFilesController],
})
export class CFilesModule {}
