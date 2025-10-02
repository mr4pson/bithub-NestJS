import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CApiAdminModule } from './api.admin/api.admin.module';
import { CApiLandingModule } from './api.landing/api.landing.module';
import { CApiMainsiteModule } from './api.mainsite/api.mainsite.module';
import { cfg } from './app.config';
import { CAutoModule } from './auto/auto.module';
import { CAdmin } from './model/entities/admin';
import { CAdminGroup } from './model/entities/admin.group';
import { CArtcat } from './model/entities/artcat';
import { CArtcatTranslation } from './model/entities/artcat.translation';
import { CArticle } from './model/entities/article';
import { CArticleTranslation } from './model/entities/article.translation';
import { CAward } from './model/entities/award';
import { CAwardTranslation } from './model/entities/award.translation';
import { CBackup } from './model/entities/backup';
import { CBaxer } from './model/entities/baxer';
import { CBaxerTranslation } from './model/entities/baxer.translation';
import { CCat } from './model/entities/cat';
import { CCatTranslation } from './model/entities/cat.translation';
import { CComment } from './model/entities/comment';
import { CCompletion } from './model/entities/completion';
import { CDailer } from './model/entities/dailer';
import { CDatemark } from './model/entities/datemark';
import { CDesk } from './model/entities/desk';
import { CDrop } from './model/entities/drop';
import { CDropTranslation } from './model/entities/drop.translation';
import { CError } from './model/entities/error';
import { CFavorition } from './model/entities/favorition';
import { CFile } from './model/entities/file';
import { CGuide } from './model/entities/guide';
import { CGuideLink } from './model/entities/guide.link';
import { CGuideNote } from './model/entities/guide.note';
import { CGuideTranslation } from './model/entities/guide.translation';
import { CInorder } from './model/entities/inorder';
import { CLang } from './model/entities/lang';
import { CLinktype } from './model/entities/linktype';
import { CMailing } from './model/entities/mailing';
import { CMailtemplate } from './model/entities/mailtemplate';
import { CMailtemplateTranslation } from './model/entities/mailtemplate.translation';
import { COutorder } from './model/entities/outorder';
import { CPage } from './model/entities/page';
import { CPageTranslation } from './model/entities/page.translation';
import { CProblem } from './model/entities/problem';
import { CProblemComment } from './model/entities/problem.comment';
import { CProblemViewing } from './model/entities/problem.viewing';
import { CPromocode } from './model/entities/promocode';
import { CProposal } from './model/entities/proposal';
import { CReading } from './model/entities/reading';
import { CReforder } from './model/entities/reforder';
import { CSetting } from './model/entities/setting';
import { CShopcat } from './model/entities/shopcat';
import { CShopcatTranslation } from './model/entities/shopcat.translation';
import { CShopitem } from './model/entities/shopitem';
import { CShopitemTranslation } from './model/entities/shopitem.translation';
import { CShoporder } from './model/entities/shoporder';
import { CShoporderItem } from './model/entities/shoporder.item';
import { CTariff } from './model/entities/tariff';
import { CTariffTranslation } from './model/entities/tariff.translation';
import { CTask } from './model/entities/task';
import { CTaskTranslation } from './model/entities/task.translation';
import { CUser } from './model/entities/user';
import { CVerification } from './model/entities/verification';
import { CViewing } from './model/entities/viewing';
import { CWord } from './model/entities/word';
import { CWordTranslation } from './model/entities/word.translation';
import { CWordbook } from './model/entities/wordbook';
import { CSocketModule } from './socket/socket.module';
import { CWithdraworder } from './model/entities/withdraworder';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: cfg.dbHost,
      port: cfg.dbPort,
      username: cfg.dbLogin,
      password: cfg.dbPassword,
      database: cfg.dbName,
      entities: [
        CAdminGroup,
        CAdmin,
        CBackup,
        CError,
        CFile,
        CLang,
        CMailtemplate,
        CMailtemplateTranslation,
        CSetting,
        CVerification,
        CWord,
        CWordTranslation,
        CWordbook,
        CPage,
        CPageTranslation,
        CCat,
        CCatTranslation,
        CLinktype,
        CGuide,
        CGuideTranslation,
        CGuideLink,
        CGuideNote,
        CTask,
        CTaskTranslation,
        CUser,
        CCompletion,
        CFavorition,
        CViewing,
        CTariff,
        CTariffTranslation,
        CPromocode,
        CInorder,
        COutorder,
        CReforder,
        CDesk,
        CProblem,
        CProblemComment,
        CProblemViewing,
        CProposal,
        CArtcat,
        CArtcatTranslation,
        CArticle,
        CArticleTranslation,
        CReading,
        CAward,
        CAwardTranslation,
        CDailer,
        CBaxer,
        CBaxerTranslation,
        CComment,
        CShopcat,
        CShopcatTranslation,
        CShopitem,
        CShopitemTranslation,
        CShoporder,
        CShoporderItem,
        CDatemark,
        CMailing,
        CDrop,
        CDropTranslation,
        CWithdraworder,
      ],
      synchronize: true,
    }),
    CApiAdminModule,
    CApiMainsiteModule,
    CApiLandingModule,
    CAutoModule,
    CSocketModule,
  ],
  controllers: [],
  providers: [],
})
export class CAppModule {}
