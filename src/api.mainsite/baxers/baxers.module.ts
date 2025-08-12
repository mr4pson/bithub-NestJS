import { Module } from "@nestjs/common";
import { CCommonModule } from "src/common/common.module";
import { CBaxersController } from "./baxers.controller";
import { CBaxersService } from "./baxers.service";

@Module({
    imports: [CCommonModule],    
    providers: [CBaxersService],
    controllers: [CBaxersController],
})
export class CBaxersModule {}
