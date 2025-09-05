import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CCommonModule } from 'src/common/common.module';
import { CUsersService } from './users.service';
import { CUsersController } from './users.controller';
import { cfg } from 'src/app.config';

@Module({
  imports: [JwtModule.register(cfg.jwtUser), CCommonModule],
  providers: [CUsersService],
  exports: [CUsersService],
  controllers: [CUsersController],
})
export class CUsersModule {}
