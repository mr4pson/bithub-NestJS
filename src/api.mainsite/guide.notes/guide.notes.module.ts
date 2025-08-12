import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CGuideNotesController } from "./guide.notes.controller";
import { CGuideNotesService } from "./guide.notes.service";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";

@Module({
    imports: [
        JwtModule.register(cfg.jwtUser),
        CCommonModule,
    ],    
    providers: [CGuideNotesService],
    controllers: [CGuideNotesController],
})
export class CGuideNotesModule {}
