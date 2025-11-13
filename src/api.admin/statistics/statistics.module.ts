import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { JwtModule } from '@nestjs/jwt';
import { cfg } from 'src/app.config';
import { CCommonModule } from 'src/common/common.module';

@Module({
  imports: [JwtModule.register(cfg.jwtAdmin), CCommonModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class CStatisticsModule {}
