import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { cfg } from "src/app.config";
import { CCommonModule } from "src/common/common.module";
import { CProblemsService } from "./problems.service";
import { CProblemsController } from "./problems.controller";

@Module({
    imports: [
        JwtModule.register(cfg.jwtUser),
        CCommonModule,
    ],    
    providers: [CProblemsService],
    controllers: [CProblemsController],    
})
export class CProblemsModule {}
