import { Module } from "@nestjs/common";
import { CProxyController } from "./proxy.controller";

@Module({
	controllers: [CProxyController],		
})
export class CProxyModule {}
