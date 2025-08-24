import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CCommonModule } from 'src/common/common.module';
import { CShopitemsController } from './shopitems.controller';
import { CShopitemsService } from './shopitems.service';
import { cfg } from 'src/app.config';

@Module({
  imports: [JwtModule.register(cfg.jwtAdmin), CCommonModule],
  providers: [CShopitemsService],
  controllers: [CShopitemsController],
})
export class CShopitemsModule {}
