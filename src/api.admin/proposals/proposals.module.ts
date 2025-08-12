import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CProposalsController } from "./proposals.controller";
import { CProposalsService } from "./proposals.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CProposalsService],
    controllers: [CProposalsController],
})
export class CProposalsModule {}
