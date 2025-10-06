import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as Nodemailer from 'nodemailer';
import { CSetting } from 'src/model/entities/setting';
import { CMailableService } from './_mailable.service';
import { CErrorsService } from '../errors.service';
import { CAppService } from '../app.service';
import { CProposal } from 'src/model/entities/proposal';
import { cfg } from 'src/app.config';
import { CUser } from 'src/model/entities/user';
import { CPromocode } from 'src/model/entities/promocode';
import { CComment } from 'src/model/entities/comment';
import { CShoporder } from 'src/model/entities/shoporder';
import { CWithdraworder } from 'src/model/entities/withdraworder';
import { CLangsService } from 'src/api.admin/langs/langs.service';
import { CWordsService } from 'src/api.mainsite/words/words.service';

@Injectable()
export class CMailService extends CMailableService {
  constructor(
    protected override dataSource: DataSource,
    protected errorsService: CErrorsService,
    protected appService: CAppService,
    protected langService: CLangsService,
    protected wordsService: CWordsService,
  ) {
    super(dataSource);
  }

  public async adminEmailVerification(
    email: string,
    code: string,
  ): Promise<void> {
    try {
      const mtd = await this.getMailtemplateData('admin-verification', 1);
      const subject = mtd.subject;
      const content = eval('`' + mtd.content + '`');
      await this.sendMessage(email, subject, content);
    } catch (err) {
      await this.errorsService.log('CMailService.adminEmailVerification', err);
    }
  }

  public async adminProposal(
    email: string,
    proposal: CProposal,
  ): Promise<void> {
    try {
      const mtd = await this.getMailtemplateData('admin-proposal', 1);
      const adminUrl = cfg.adminUrl; // will use in eval
      const subject = mtd.subject;
      const content = eval('`' + mtd.content + '`');
      await this.sendMessage(email, subject, content);
    } catch (err) {
      await this.errorsService.log('CMailService.adminProposal', err);
    }
  }

  public async adminComment(email: string, comment: CComment): Promise<void> {
    try {
      const mtd = await this.getMailtemplateData('admin-comment', 1);
      const adminUrl = cfg.adminUrl; // will use in eval
      const subject = mtd.subject;
      const content = eval('`' + mtd.content + '`');
      await this.sendMessage(email, subject, content);
    } catch (err) {
      await this.errorsService.log('CMailService.adminComment', err);
    }
  }

  public async adminShoporder(
    email: string,
    shoporder: CShoporder,
  ): Promise<void> {
    try {
      const mtd = await this.getMailtemplateData('admin-shoporder', 1);
      const adminUrl = cfg.adminUrl; // will use in eval
      const subject = mtd.subject;
      const content = eval('`' + mtd.content + '`');
      await this.sendMessage(email, subject, content);
    } catch (err) {
      await this.errorsService.log('CMailService.adminShoporder', err);
    }
  }

  public async adminWithdraworder(
    email: string,
    withdraworder: CWithdraworder,
  ): Promise<void> {
    try {
      const mtd = await this.getMailtemplateData('admin-withdraworder', 1);
      const adminUrl = cfg.adminUrl; // will use in eval
      const subject = mtd.subject;
      const content = eval('`' + mtd.content + '`');
      await this.sendMessage(email, subject, content);
    } catch (err) {
      await this.errorsService.log('CMailService.adminWithdraworder', err);
    }
  }

  public async userEmailVerification(
    email: string,
    lang_id: number,
    code: string,
  ): Promise<void> {
    try {
      const mtd = await this.getMailtemplateData('user-verification', lang_id);
      const subject = mtd.subject;
      const content = mtd.content.replace('${code}', code);
      console.log(mtd, content);
      await this.sendMessage(email, subject, content);
    } catch (err) {
      await this.errorsService.log('CMailService.userEmailVerification', err);
    }
  }

  public async userNosubscriptionReminder(user: CUser): Promise<void> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-nosubs-reminder',
        user.lang_id,
      );
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const subject = mtd.subject;
      const content = eval('`' + mtd.content + '`');
      await this.sendMessage(user.email, subject, content, user);
    } catch (err) {
      await this.errorsService.log(
        'CMailService.userNosubscriptionReminder',
        err,
      );
    }
  }

  public async userNosubscriptionPromo(
    user: CUser,
    promocode: CPromocode,
  ): Promise<void> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-nosubs-promo',
        user.lang_id,
      );
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const subject = mtd.subject;
      const content = eval('`' + mtd.content + '`');
      await this.sendMessage(user.email, subject, content, user);
    } catch (err) {
      await this.errorsService.log('CMailService.userNosubscriptionPromo', err);
    }
  }

  public async userNopayReminder(user: CUser): Promise<void> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-nopay-reminder',
        user.lang_id,
      );
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const subject = mtd.subject;
      const content = eval('`' + mtd.content + '`');
      await this.sendMessage(user.email, subject, content, user);
    } catch (err) {
      await this.errorsService.log('CMailService.userNopayReminder', err);
    }
  }

  public async userRegister(user: CUser): Promise<void> {
    try {
      const mtd = await this.getMailtemplateData('user-register', user.lang_id);
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const subject = mtd.subject;
      const content = eval('`' + mtd.content + '`');

      await this.sendMessage(user.email, subject, content, user);
    } catch (err) {
      await this.errorsService.log('CMailService.userRegister', err);
    }
  }

  public async userSubscription(user: CUser): Promise<void> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-subscription',
        user.lang_id,
      );
      const subject = mtd.subject;
      const content = eval('`' + mtd.content + '`');
      await this.sendMessage(user.email, subject, content, user);
    } catch (err) {
      await this.errorsService.log('CMailService.userSubscription', err);
    }
  }

  public async userSubscriptionEnds(user: CUser): Promise<void> {
    try {
      const mtd = await this.getMailtemplateData(
        'user-subscription-ends',
        user.lang_id,
      );
      const mainsiteUrl = cfg.mainsiteUrl; // will use in eval
      const date = this.appService.humanDate(
        this.appService.utcToLocal(user.paid_until, user.tz),
        true,
      ); // will use in eval
      const subject = mtd.subject;
      const content = eval('`' + mtd.content + '`');
      await this.sendMessage(user.email, subject, content, user);
    } catch (err) {
      await this.errorsService.log('CMailService.userSubscription', err);
    }
  }

  /////////////////////
  // utils
  /////////////////////

  public async sendMessage(
    to: string,
    subject: string,
    html: string,
    user?: CUser,
  ): Promise<void> {
    const host = (
      await this.dataSource
        .getRepository(CSetting)
        .findOne({ where: { p: 'smtp-host' } })
    )?.v;
    const port = (
      await this.dataSource
        .getRepository(CSetting)
        .findOne({ where: { p: 'smtp-port' } })
    )?.v;
    const login = (
      await this.dataSource
        .getRepository(CSetting)
        .findOne({ where: { p: 'smtp-login' } })
    )?.v;
    const from = (
      await this.dataSource
        .getRepository(CSetting)
        .findOne({ where: { p: 'smtp-from' } })
    )?.v;
    const pw = (
      await this.dataSource
        .getRepository(CSetting)
        .findOne({ where: { p: 'smtp-pw' } })
    )?.v;
    const secure = (
      await this.dataSource
        .getRepository(CSetting)
        .findOne({ where: { p: 'smtp-secure' } })
    )?.v;
    const hostname = (
      await this.dataSource
        .getRepository(CSetting)
        .findOne({ where: { p: 'smtp-hostname' } })
    )?.v;

    if ([host, port, login, from, pw, secure, hostname].includes(undefined)) {
      throw 'some SMTP setting not found';
    }

    const lang = await this.langService.one(user?.lang_id || 1); // set default lang for templates
    const slug = lang.data.slug || 'en';
    const words = await this.wordsService.all();
    const unsubscribeWord = words.data.common.unsubscribe[slug];
    const fromEmailWord = words.data.common['from-email'][slug];

    let htmlWithUnsubscribe = html;

    if (user) {
      htmlWithUnsubscribe =
        html +
        `<br><br><hr><small><a href="${cfg.mainsiteUrl}/${slug}/unsubscribe/${user.uuid}">${unsubscribeWord}</a> ${fromEmailWord}</small>`;
    }

    const transporter = Nodemailer.createTransport({
      host,
      name: hostname,
      port: parseInt(port),
      secure: secure === 'true',
      auth: { user: login, pass: pw },
    });
    const data = await transporter.sendMail({
      from,
      to,
      subject,
      html: htmlWithUnsubscribe,
    });
    console.log(
      new Date(),
      'CMailService.sendMessage response:',
      data.response,
    );
  }
}
