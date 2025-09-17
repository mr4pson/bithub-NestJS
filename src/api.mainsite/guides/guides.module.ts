import { Module } from '@nestjs/common';
import { CCommonModule } from 'src/common/common.module';
import { CGuidesController } from './guides.controller';
import { CGuidesService } from './guides.service';
import { JwtModule } from '@nestjs/jwt';
import { cfg } from 'src/app.config';
import { CSocketModule } from 'src/socket/socket.module';
import { CUsersModule } from '../users/users.module';

@Module({
  imports: [
    CCommonModule,
    JwtModule.register(cfg.jwtUser),
    CSocketModule,
    CUsersModule,
  ],
  providers: [CGuidesService],
  controllers: [CGuidesController],
})
export class CGuidesModule {}
