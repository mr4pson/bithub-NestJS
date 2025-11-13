import { Module } from '@nestjs/common';
import { CCommonModule } from 'src/common/common.module';
import { CToolcatsController } from './toolcats.controller';
import { CToolcatsService } from './toolcats.service';

@Module({
  imports: [CCommonModule],
  providers: [CToolcatsService],
  controllers: [CToolcatsController],
})
export class CToolcatsModule {}
