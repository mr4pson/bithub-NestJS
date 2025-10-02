import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CCommonModule } from 'src/common/common.module';
import { cfg } from 'src/app.config';
import { CWithdrawordersController } from './withdraworders.controller';
import { CWithdrawordersService } from './withdraworders.service';

@Module({
  imports: [JwtModule.register(cfg.jwtAdmin), CCommonModule],
  providers: [CWithdrawordersService],
  controllers: [CWithdrawordersController],
})
export class CWithdrawordersModule {}
