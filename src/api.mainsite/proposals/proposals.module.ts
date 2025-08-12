import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CCommonModule } from "src/common/common.module";
import { CProposalsService } from "./proposals.service";
import { CProposalsController } from "./proposals.controller";

@Module({
    imports: [
        JwtModule.register(cfg.jwtUser),
        CCommonModule,
    ],    
    providers: [CProposalsService],
    controllers: [CProposalsController],    
})
export class CProposalsModule {}
