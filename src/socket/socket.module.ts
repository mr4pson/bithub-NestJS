import { Module } from "@nestjs/common";
import { CSocketGateway } from "./socket.gateway";
import { CCommonModule } from "src/common/common.module";

@Module({
    imports: [CCommonModule],
    providers: [CSocketGateway],
    exports: [CSocketGateway],
})
export class CSocketModule {}
