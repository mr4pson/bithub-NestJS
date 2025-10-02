import { Module } from '@nestjs/common';
import { CBackupsModule } from './backups/backups.module';
import { CObjectsModule } from './objects/objects.module';
import { CAdminsModule } from './admins/admins.module';
import { CAdminGroupsModule } from './admin.groups/admin.groups.module';
import { CSettingsModule } from './settings/settings.module';
import { CLangsModule } from './langs/langs.module';
import { CWordbooksModule } from './wordbooks/wordbooks.module';
import { CFilesModule } from './files/files.module';
import { CMailtemplatesModule } from './mailtemplates/mailtemplates.module';
import { CCatsModule } from './cats/cats.module';
import { CLinktypesModule } from './linktypes/linktypes.module';
import { CPagesModule } from './pages/pages.module';
import { CGuidesModule } from './guides/guides.module';
import { CUsersModule } from './users/users.module';
import { CStatsModule } from './stats/stats.module';
import { CTariffsModule } from './tariffs/tariffs.module';
import { CPromocodesModule } from './promocodes/promocodes.module';
import { CInordersModule } from './inorders/inorders.module';
import { COutordersModule } from './outorders/outorders.module';
import { CRefordersModule } from './reforders/reforders.module';
import { CProposalsModule } from './proposals/proposals.module';
import { CArtcatsModule } from './artcats/artcats.module';
import { CArticlesModule } from './articles/articles.module';
import { CAwardsModule } from './awards/awards.module';
import { CBaxersModule } from './baxers/baxers.module';
import { CCommentsModule } from './comments/comments.module';
import { CShopcatsModule } from './shopcats/shopcats.module';
import { CShopitemsModule } from './shopitems/shopitems.module';
import { CShopordersModule } from './shoporders/shoporders.module';
import { CMailingsModule } from './mailings/mailings.module';
import { CDropsModule } from './drops/drops.module';
import { CWithdrawordersModule } from './withdraworders/withdraworders.module';

@Module({
  imports: [
    CObjectsModule,
    CAdminsModule,
    CAdminGroupsModule,
    CSettingsModule,
    CLangsModule,
    CWordbooksModule,
    CFilesModule,
    CBackupsModule,
    CMailtemplatesModule,
    CPagesModule,
    CUsersModule,
    CCatsModule,
    CLinktypesModule,
    CGuidesModule,
    CStatsModule,
    CTariffsModule,
    CPromocodesModule,
    CInordersModule,
    COutordersModule,
    CRefordersModule,
    CProposalsModule,
    CArtcatsModule,
    CArticlesModule,
    CAwardsModule,
    CBaxersModule,
    CCommentsModule,
    CShopcatsModule,
    CShopitemsModule,
    CShopordersModule,
    CWithdrawordersModule,
    CMailingsModule,
    CDropsModule,
  ],
})
export class CApiAdminModule {}
