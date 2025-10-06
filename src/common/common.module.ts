import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CAppService } from './services/app.service';
import { CErrorsService } from './services/errors.service';
import { CSlugService } from './services/slug.service';
import { CUploadsService } from './services/uploads.service';
import { CResizeService } from './services/resize.service';
import { CNetworkService } from './services/network.service';
import { CMailService } from './services/mailable/mail.service';
import { CTgBotService } from './services/mailable/tg.bot.service';
import { CCaptchaService } from './services/captcha.service';
import { CAuthService } from './services/auth.service';
import { CTgApiService } from './services/tg.api.service';
import { CLangsService } from 'src/api.admin/langs/langs.service';
import { CWordsService } from 'src/api.mainsite/words/words.service';

@Module({
  imports: [HttpModule],
  providers: [
    CAppService,
    CErrorsService,
    CUploadsService,
    CMailService,
    CLangsService,
    CWordsService,
    CTgBotService,
    CTgApiService,
    CSlugService,
    CResizeService,
    CAuthService,
    CNetworkService,
    CCaptchaService,
  ],
  exports: [
    CAppService,
    CErrorsService,
    CUploadsService,
    CLangsService,
    CWordsService,
    CMailService,
    CTgBotService,
    CTgApiService,
    CSlugService,
    CResizeService,
    CAuthService,
    CNetworkService,
    CCaptchaService,
  ],
})
export class CCommonModule {}
