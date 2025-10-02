import { Module } from '@nestjs/common';
import { CCommonModule } from 'src/common/common.module';
import { CWithdrawordersController } from './withdraworders.controller';
import { CWithdrawordersService } from './withdraworders.service';
import { JwtModule } from '@nestjs/jwt';
import { cfg } from 'src/app.config';
import { CSocketModule } from 'src/socket/socket.module';

@Module({
  imports: [CCommonModule, CSocketModule, JwtModule.register(cfg.jwtUser)],
  providers: [CWithdrawordersService],
  controllers: [CWithdrawordersController],
})
export class CWithdrawordersModule {}
