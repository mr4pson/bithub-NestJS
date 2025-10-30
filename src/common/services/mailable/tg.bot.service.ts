import { Injectable, OnModuleInit } from '@nestjs/common';
import { CSetting } from 'src/model/entities/setting';
import { DataSource } from 'typeorm';
import { IKeyValue } from 'src/model/keyvalue.interface';
import { cfg } from 'src/app.config';
import { CUser } from 'src/model/entities/user';
import { CGuide } from 'src/model/entities/guide';
import { CTask } from 'src/model/entities/task';
import { CMailableService } from './_mailable.service';
import { CNetworkService } from '../network.service';
import { CErrorsService } from '../errors.service';
import { CAppService } from '../app.service';
import { CArticle } from 'src/model/entities/article';
import { CShopitem } from 'src/model/entities/shopitem';
import * as crypto from 'crypto';

export interface ITgResponse {
  readonly ok: boolean;
  readonly result?: any;
  readonly error_code?: number;
  readonly description?: string;
}

@Injectable()
export class CTgBotService extends CMailableService implements OnModuleInit {
  constructor(
    protected override dataSource: DataSource,
    protected networkService: CNetworkService,
    protected errorsService: CErrorsService,
    protected appService: CAppService,
  ) {
    super(dataSource);
  }

  ////////////////
  // lifecycle
  ////////////////

  public async onModuleInit(): Promise<void> {
    try {
      // start background polling for Telegram updates
      if (!cfg.tgInitOnStart) return;
      const tgbotWhToken = (
        await this.dataSource
          .getRepository(CSetting)
          .findOneBy({ p: 'tgbot-whtoken' })
      )?.v;
      if (!tgbotWhToken) throw 'tgbot-whtoken not found in settings';
      const data = await this.sendRequest('setWebhook', {
        url: `${cfg.backUrl}/api/admin/users/tg-event`,
        secret_token: tgbotWhToken,
      });
      console.log('api.admin/CTelegramBotService.initWebhook:');
      console.log(data);
    } catch (err) {
      await this.errorsService.log('api.admin/CTgBotService.onModuleInit', err);
    }
  }

  ////////////////
  // actions
  ////////////////

  public async userNewtask(
    user: CUser,
    guide: CGuide,
    task: CTask,
  ): Promise<number> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-tg-newtask',
        user.lang_id,
      );
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const content = eval('`' + mtd.content + '`');
      const statusCode = await this.sendMessage(user.tg_id, content);
      return statusCode;
    } catch (err) {
      await this.errorsService.log('api.admin/CTgBotService.userNewtask', err);
      return -1;
    }
  }

  public async userNewguide(user: CUser, guide: CGuide): Promise<number> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-tg-newguide',
        user.lang_id,
      );
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const content = eval('`' + mtd.content + '`');
      const statusCode = await this.sendMessage(user.tg_id, content);
      return statusCode;
    } catch (err) {
      await this.errorsService.log('api.admin/CTgBotService.userNewguide', err);
      return -1;
    }
  }

  public async userGuideReminder(user: CUser, guide: CGuide): Promise<number> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-tg-guidereminder',
        user.lang_id,
      );
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const content = eval('`' + mtd.content + '`');
      const statusCode = await this.sendMessage(user.tg_id, content);
      return statusCode;
    } catch (err) {
      await this.errorsService.log(
        'api.admin/CTgBotService.userGuideReminder',
        err,
      );
      return -1;
    }
  }

  public async userNewarticle(user: CUser, article: CArticle): Promise<number> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-tg-newarticle',
        user.lang_id,
      );
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const content = eval('`' + mtd.content + '`');
      const statusCode = await this.sendMessage(user.tg_id, content);
      return statusCode;
    } catch (err) {
      await this.errorsService.log(
        'api.admin/CTgBotService.userNewarticle',
        err,
      );
      return -1;
    }
  }

  public async userNewShopitem(
    user: CUser,
    shopitem: CShopitem,
  ): Promise<number> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-tg-newshopitem',
        user.lang_id,
      );
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const content = eval('`' + mtd.content + '`');
      const statusCode = await this.sendMessage(user.tg_id, content);
      return statusCode;
    } catch (err) {
      await this.errorsService.log(
        'api.admin/CTgBotService.userNewshopitem',
        err,
      );
      return -1;
    }
  }

  public async userDeadline(user: CUser, task: CTask): Promise<number> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-tg-deadline',
        user.lang_id,
      );
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const content = eval('`' + mtd.content + '`');
      const statusCode = await this.sendMessage(user.tg_id, content);
      return statusCode;
    } catch (err) {
      await this.errorsService.log('api.admin/CTgBotService.userDeadline', err);
      return -1;
    }
  }

  public async userWelcome(user: CUser): Promise<number> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-tg-welcome',
        user.lang_id,
      );
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const content = eval('`' + mtd.content + '`');
      const statusCode = await this.sendMessage(user.tg_id, content);
      return statusCode;
    } catch (err) {
      await this.errorsService.log('api.admin/CTgBotService.userWelcome', err);
      return -1;
    }
  }

  public async userAuthenticate(
    tgId: number,
    langId: number,
    link: string,
  ): Promise<number> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-tg-authenticate',
        langId,
      );
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const content = eval('`' + mtd.content + '`');
      const statusCode = await this.sendMessage(tgId, content);
      return statusCode;
    } catch (err) {
      await this.errorsService.log(
        'api.admin/CTgBotService.userAuthenticate',
        err,
      );
      return -1;
    }
  }

  /////////////////
  // utils
  /////////////////

  protected async sendMessage(
    chat_id: number,
    content: string,
  ): Promise<number> {
    try {
      const dto = { chat_id, text: content, parse_mode: 'HTML' };
      await this.sendRequest('sendMessage', dto);
      return 200;
    } catch (err) {
      console.log(err);
      return err.error_code || 500;
    }
  }

  private async sendRequest(
    method: string,
    dto: IKeyValue<any> = null,
  ): Promise<any> {
    const tgbotToken = (
      await this.dataSource
        .getRepository(CSetting)
        .findOneBy({ p: 'tgbot-token' })
    )?.v;
    const tgbotApiUrl = (
      await this.dataSource
        .getRepository(CSetting)
        .findOneBy({ p: 'tgbot-apiurl' })
    )?.v;
    if (!tgbotToken) throw 'tgbot-token not found in settings';
    if (!tgbotApiUrl) throw 'tgbot-url not found in settings';
    const url = tgbotApiUrl
      .replace(/{{token}}/g, tgbotToken)
      .replace(/{{method}}/g, method);
    const res = await this.networkService.post(url, dto);
    return res.data;
  }

  private async test(): Promise<void> {
    const user = await this.dataSource
      .getRepository(CUser)
      .findOne({ where: { id: 1879 }, relations: ['lang'] });
    const guide = await this.dataSource
      .getRepository(CGuide)
      .findOne({ where: { id: 10171 }, relations: ['translations'] });
    const task = await this.dataSource
      .getRepository(CTask)
      .findOne({ where: { id: 151164 }, relations: ['translations'] });
    this.userWelcome(user);
    this.userNewtask(user, guide, task);
  }
}
