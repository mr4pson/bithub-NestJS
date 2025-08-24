import { Module } from '@nestjs/common';
import { CCommonModule } from 'src/common/common.module';
import { CShopordersController } from './shoporders.controller';
import { CShopordersService } from './shoporders.service';
import { JwtModule } from '@nestjs/jwt';
import { cfg } from 'src/app.config';
import { CSocketModule } from 'src/socket/socket.module';

@Module({
  imports: [CCommonModule, CSocketModule, JwtModule.register(cfg.jwtUser)],
  providers: [CShopordersService],
  controllers: [CShopordersController],
})
export class CShopordersModule {}
