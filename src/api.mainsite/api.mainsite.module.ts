import { Module } from '@nestjs/common';
import { CLangsModule } from './langs/langs.module';
import { CPagesModule } from './pages/pages.module';
import { CSettingsModule } from './settings/settings.module';
import { CWordsModule } from './words/words.module';
import { CFilesModule } from './files/files.module';
import { CProxyModule } from './proxy/proxy.module';
import { CUsersModule } from './users/users.module';
import { CCatsModule } from './cats/cats.module';
import { CGuidesModule } from './guides/guides.module';
import { CTasksModule } from './tasks/tasks.module';
import { CTariffsModule } from './tariffs/tariffs.module';
import { CPromocodesModule } from './promocodes/promocodes.module';
import { CInordersModule } from './inorders/inorders.module';
import { COutordersModule } from './outorders/outorders.module';
import { CGuideNotesModule } from './guide.notes/guide.notes.module';
import { CDesksModule } from './desks/desks.module';
import { CProblemsModule } from './problems/problems.module';
import { CProblemCommentsModule } from './problem.comments/problem.comments.module';
import { CProposalsModule } from './proposals/proposals.module';
import { CArtcatsModule } from './artcats/artcats.module';
import { CArticlesModule } from './articles/articles.module';
import { CDailersModule } from './dailers/dailers.module';
import { CBaxersModule } from './baxers/baxers.module';
import { CCommentsModule } from './comments/comments.module';
import { CShopcatsModule } from './shopcats/shopcats.module';
import { CShopitemsModule } from './shopitems/shopitems.module';
import { CShopordersModule } from './shoporders/shoporders.module';
import { CDatemarksModule } from './datemarks/datemarks.module';
import { CDropsModule } from './drops/drops.module';
import { CWithdrawordersModule } from './withdraworders/withdraworders.module';
import { CToolsModule } from './tools/tools.module';
import { CToolcatsModule } from './toolcats/toolcats.module';

@Module({
  imports: [
    CProxyModule,
    CSettingsModule,
    CLangsModule,
    CWordsModule,
    CFilesModule,
    CPagesModule,
    CUsersModule,
    CCatsModule,
    CGuidesModule,
    CTasksModule,
    CTariffsModule,
    CPromocodesModule,
    CInordersModule,
    COutordersModule,
    CGuideNotesModule,
    CDesksModule,
    CProblemsModule,
    CProblemCommentsModule,
    CProposalsModule,
    CArtcatsModule,
    CArticlesModule,
    CToolsModule,
    CToolcatsModule,
    CDailersModule,
    CBaxersModule,
    CCommentsModule,
    CShopcatsModule,
    CShopitemsModule,
    CShopordersModule,
    CDatemarksModule,
    CDropsModule,
    CWithdrawordersModule,
  ],
})
export class CApiMainsiteModule {}
