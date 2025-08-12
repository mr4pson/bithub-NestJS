import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CFilesController } from "./files.controller";
import { CFilesService } from "./files.service";
import { CCommonModule } from "src/common/common.module";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CFilesService],
    controllers: [CFilesController],    
})
export class CFilesModule {}
