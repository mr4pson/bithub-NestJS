import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { cfg } from 'src/app.config';
import { CCommonModule } from 'src/common/common.module';
import { CToolsController } from './tools.controller';
import { CToolsService } from './tools.service';

@Module({
  imports: [CCommonModule, JwtModule.register(cfg.jwtUser)],
  providers: [CToolsService],
  controllers: [CToolsController],
})
export class CToolsModule {}
