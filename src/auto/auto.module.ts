import { Module } from '@nestjs/common';
import { CCommonModule } from 'src/common/common.module';
import { CBackupsAutoService } from './backups.auto.service';
import { CBackupsModule } from 'src/api.admin/backups/backups.module';
import { CDailersAutoService } from './dailers.auto.service';
import { CGuidesAutoService } from './guides.auto.service';
import { CUsersAutoService } from './users.auto.service';

@Module({
  imports: [CCommonModule, CBackupsModule],
  providers: [
    CBackupsAutoService,
    //CTwitterScoreAutoService, пока отключаем
    CDailersAutoService,
    CGuidesAutoService,
    CUsersAutoService,
  ],
})
export class CAutoModule {}
