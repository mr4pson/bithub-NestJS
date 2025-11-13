import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CCommonModule } from 'src/common/common.module';
import { cfg } from 'src/app.config';
import { CToolsService } from './tools.service';
import { CToolsController } from './tools.controller';

@Module({
  imports: [JwtModule.register(cfg.jwtAdmin), CCommonModule],
  providers: [CToolsService],
  controllers: [CToolsController],
})
export class CToolsModule {}
