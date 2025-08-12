import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CPagesController } from "./pages.controller";
import { CPagesService } from "./pages.service";

@Module({
    imports: [CCommonModule],    
    providers: [CPagesService],
    controllers: [CPagesController],
})
export class CPagesModule {}
