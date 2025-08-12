import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CObjectsController } from "./objects.controller";
import { CObjectsService } from "./objects.service";
import { cfg } from "src/app.config";
import { CCommonModule } from "src/common/common.module";

@Module({
	imports: [		
		JwtModule.register(cfg.jwtAdmin),			
		CCommonModule,
	],
	controllers: [CObjectsController],
	providers: [CObjectsService],
})
export class CObjectsModule {}
