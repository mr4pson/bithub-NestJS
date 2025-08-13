import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { cfg } from './app.config';
import { CAdminGroup } from './model/entities/admin.group';
import { CAdmin } from './model/entities/admin';
import { CBackup } from './model/entities/backup';
import { CError } from './model/entities/error';
import { CFile } from './model/entities/file';
import { CLang } from './model/entities/lang';
import { CMailtemplate } from './model/entities/mailtemplate';
import { CMailtemplateTranslation } from './model/entities/mailtemplate.translation';
import { CSetting } from './model/entities/setting';
import { CVerification } from './model/entities/verification';
import { CWord } from './model/entities/word';
import { CWordTranslation } from './model/entities/word.translation';
import { CWordbook } from './model/entities/wordbook';
import { CAutoModule } from './auto/auto.module';
import { CCat } from './model/entities/cat';
import { CCatTranslation } from './model/entities/cat.translation';
import { CLinktype } from './model/entities/linktype';
import { CPage } from './model/entities/page';
import { CPageTranslation } from './model/entities/page.translation';
import { CGuide } from './model/entities/guide';
import { CGuideTranslation } from './model/entities/guide.translation';
import { CGuideLink } from './model/entities/guide.link';
import { CTask } from './model/entities/task';
import { CTaskTranslation } from './model/entities/task.translation';
import { CApiAdminModule } from './api.admin/api.admin.module';
import { CUser } from './model/entities/user';
import { CApiMainsiteModule } from './api.mainsite/api.mainsite.module';
import { CCompletion } from './model/entities/completion';
import { CFavorition } from './model/entities/favorition';
import { CTariff } from './model/entities/tariff';
import { CTariffTranslation } from './model/entities/tariff.translation';
import { CPromocode } from './model/entities/promocode';
import { CInorder } from './model/entities/inorder';
import { CSocketModule } from './socket/socket.module';
import { COutorder } from './model/entities/outorder';
import { CReforder } from './model/entities/reforder';
import { CGuideNote } from './model/entities/guide.note';
import { CViewing } from './model/entities/viewing';
import { CDesk } from './model/entities/desk';
import { CProblem } from './model/entities/problem';
import { CProblemComment } from './model/entities/problem.comment';
import { CProblemViewing } from './model/entities/problem.viewing';
import { CProposal } from './model/entities/proposal';
import { CArtcat } from './model/entities/artcat';
import { CArtcatTranslation } from './model/entities/artcat.translation';
import { CArticle } from './model/entities/article';
import { CArticleTranslation } from './model/entities/article.translation';
import { CReading } from './model/entities/reading';
import { CAward } from './model/entities/award';
import { CAwardTranslation } from './model/entities/award.translation';
import { CApiLandingModule } from './api.landing/api.landing.module';
import { CDailer } from './model/entities/dailer';
import { CBaxer } from './model/entities/baxer';
import { CBaxerTranslation } from './model/entities/baxer.translation';
import { CComment } from './model/entities/comment';
import { CShopcat } from './model/entities/shopcat';
import { CShopcatTranslation } from './model/entities/shopcat.translation';
import { CShopitem } from './model/entities/shopitem';
import { CShopitemTranslation } from './model/entities/shopitem.translation';
import { CShoporder } from './model/entities/shoporder';
import { CDatemark } from './model/entities/datemark';
import { CMailing } from './model/entities/mailing';
import { CDrop } from './model/entities/drop';
import { CDropTranslation } from './model/entities/drop.translation';

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
        CDatemark,
        CMailing,
        CDrop,
        CDropTranslation,
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
