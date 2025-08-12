import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CCommonModule } from "src/common/common.module";
import { cfg } from "src/app.config";
import { CMailtemplatesController } from "./mailtemplates.controller";
import { CMailtemplatesService } from "./mailtemplates.service";

@Module({
    imports: [
        JwtModule.register(cfg.jwtAdmin),
        CCommonModule,
    ],    
    providers: [CMailtemplatesService],
    controllers: [CMailtemplatesController],
})
export class CMailtemplatesModule {}
