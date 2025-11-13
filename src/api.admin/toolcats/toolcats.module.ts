import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CCommonModule } from 'src/common/common.module';
import { cfg } from 'src/app.config';
import { CToolcatsController } from './toolcats.controller';
import { CToolcatsService } from './toolcats.service';

@Module({
  imports: [JwtModule.register(cfg.jwtAdmin), CCommonModule],
  providers: [CToolcatsService],
  controllers: [CToolcatsController],
})
export class CToolcatsModule {}
