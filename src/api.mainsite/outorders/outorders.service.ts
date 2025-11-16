import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { COutorder } from 'src/model/entities/outorder';
import { DataSource } from 'typeorm';
import { CPromocodesService } from '../promocodes/promocodes.service';
import { IOutorderCreate } from './dto/outorder.create.interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CUser } from 'src/model/entities/user';
import { CTariff } from 'src/model/entities/tariff';
import { CPromocode } from 'src/model/entities/promocode';
import { CMailService } from 'src/common/services/mailable/mail.service';
import { CTgApiService } from 'src/common/services/tg.api.service';
import { CSetting } from 'src/model/entities/setting';
import { SUBSCRIPTION_LIST } from './constants';
import { cfg } from 'src/app.config';
import { INowPaymentsPayment } from '../inorders/dto';
import { CNetworkService } from 'src/common/services/network.service';
import { CReforder } from 'src/model/entities/reforder';
import { CSocketGateway } from 'src/socket/socket.gateway';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require('crypto');

@Injectable()
export class COutordersService {
  constructor(
    private dataSource: DataSource,
    private errorsService: CErrorsService,
    private promocodesService: CPromocodesService,
    private mailService: CMailService,
    private tgapiService: CTgApiService,
    private socketGateway: CSocketGateway,
    private networkService: CNetworkService,
  ) {}

  public async create(
    dto: IOutorderCreate,
    user_id: number,
  ): Promise<IResponse<string>> {
    try {
      const user = await this.dataSource.getRepository(CUser).findOne({
        where: { id: user_id, active: true },
        relations: ['referrer'],
      });
      if (!user) return { statusCode: 404, error: 'user not found' };
      const currentUserSubType = user.subType;
      const tariff = await this.dataSource
        .getRepository(CTariff)
        .findOne({ where: { id: dto.tariff_id }, relations: ['translations'] });
      if (!tariff) return { statusCode: 404, error: 'tariff not found' };
      let promocode: CPromocode = null;

      if (dto.code) {
        promocode = await this.dataSource
          .getRepository(CPromocode)
          .findOneBy({ code: dto.code });
        if (!this.promocodesService.check(promocode))
          return { statusCode: 409, error: 'code is invalid' };
      }

      let preamount = 0;
      const subscription = SUBSCRIPTION_LIST.find(
        (subscription) => subscription.type === dto.subscriptionType,
      );

      if (dto.subscriptionType) {
        const price = subscription.price?.find(
          (priceItem) => priceItem.period === tariff.period,
        );
        preamount = price.value * dto.q; // для подписок всегда q=1
        user.subType = dto.subscriptionType as 'dg-pro' | 'dg-team';
      } else {
        preamount = tariff.price * dto.q; // для подписок всегда q=1
      }

      const discount = promocode ? (preamount / 100) * promocode.discount : 0;
      const amount = parseFloat((preamount - discount).toFixed(2));
      if (amount > user.money && user.money > 0)
        return { statusCode: 410, error: 'insufficient money' };
      // build outorder
      const tariffName = tariff.translations.find((t) => t.lang_id === 1)?.name;
      const tariffNote = tariff.translations.find((t) => t.lang_id === 1)?.note;
      const subscriptionName = subscription ? `${subscription.name} ` : '';
      const purpose =
        subscriptionName + tariffName + (tariffNote ? ' ' + tariffNote : '');
      const outorder = this.dataSource.getRepository(COutorder).create({
        user_email: user.email,
        amount,
        purpose,
        promocode: dto.code,
        tariff_id: dto.tariff_id,
        qty: dto.q,
        subType: dto.subscriptionType,
      });
      await this.dataSource.getRepository(COutorder).save(outorder);

      if (user.money === 0) {
        const url = await this.nowPaymentsCreatePayment(
          outorder,
          dto.lang_slug,
          amount,
        );

        return { statusCode: 201, data: url };
      }

      // update user
      user.money -= amount;

      // переводим откат рефереру, если есть
      const referrer = user.referrer;

      if (referrer && referrer.active && referrer.referral_percent) {
        const otkat = (outorder.amount / 100) * referrer.referral_percent;

        console.log(otkat);

        referrer.money += otkat;
        await this.dataSource.getRepository(CUser).save(referrer);

        const reforder = this.dataSource.getRepository(CReforder).create({
          referrer_email: referrer.email,
          referee_email: user.email,
          amount: otkat,
          order_id: referrer.id,
          type: 'outorder',
        });
        await this.dataSource.getRepository(CReforder).save(reforder);
        this.socketGateway.broadcast({ event: `user:reload:${referrer.id}` });
      }

      if (tariff.type === 'subscription') {
        // subscription
        const now = new Date();

        user.paid_at = now;

        if (!user.paid_until || user.paid_until.getTime() < now.getTime()) {
          user.paid_until = new Date();
        }

        if (
          user.paid_until.getTime() >= now.getTime() &&
          currentUserSubType !== 'dg-team' &&
          user.subType === 'dg-team'
        )
          user.children_limit += 15;

        user.paid_until.setDate(user.paid_until.getDate() + tariff.period);

        if (!user.tg_invite) user.tg_invite = await this.buildInviteLink();

        if (user.subscribed) {
          this.mailService.userSubscription(user);
        }
      }

      if (tariff.type === 'onetime') {
        // one-time purchase
        if (tariff.code === 'subacc') {
          // children limit increasion
          user.children_limit += dto.q;
        }
      }

      await this.dataSource.getRepository(CUser).save(user);

      // update promocode
      if (promocode?.limit === 'activation') {
        promocode.activation_limit--;
        await this.dataSource.getRepository(CPromocode).save(promocode);
      }

      return { statusCode: 201 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/COutordersService.create',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  /////////////////
  // utils
  /////////////////

  private async buildInviteLink(): Promise<string> {
    const groupName = (
      await this.dataSource
        .getRepository(CSetting)
        .findOneBy({ p: 'tgapi-group' })
    )?.v;
    if (!groupName) return null;
    return await this.tgapiService.getGroupInviteLink(groupName);
  }

  /*
    private async sendSubscriptionMail(user: CUser): Promise<void> {
        const groupName = (await this.dataSource.getRepository(CSetting).findOneBy({p: "tgapi-group"}))?.v;
        if (!groupName) return;
        const invite = await this.tgapiService.getGroupInviteLink(groupName);
        if (!invite) return;
        this.mailService.userSubscription(user, invite);
    }
        */

  private async nowPaymentsCreatePayment(
    outorder: COutorder,
    langSlug: string,
    amount: number,
  ) {
    const url = 'https://api.nowpayments.io/v1/invoice';
    const payload = {
      price_amount: amount,
      price_currency: 'usd',
      order_id: outorder.id,
      order_description: 'Subscription upgrade',
      ipn_callback_url: `${cfg.backUrl}/api/mainsite/outorders/complete`,
      success_url: `${cfg.mainsiteUrl}/${langSlug}/payment-success`,
      cancel_url: `${cfg.mainsiteUrl}/${langSlug}/payment-fail`,
    };
    const headers = { 'x-api-key': cfg.onepayApiKey };
    const res = await this.networkService.post(url, payload, { headers });
    const paymentData = res.data as INowPaymentsPayment;

    console.log('payment created', res.data);

    outorder.outer_id = paymentData.id;
    await this.dataSource.getRepository(COutorder).save(outorder);

    return paymentData.invoice_url;
  }

  public async complete(dto: any, signature: string): Promise<string> {
    // dto: INowPaymentsPayment
    try {
      console.log(`nowpayments-ipn-received ${new Date()}`);
      console.log('ORIGINAL DTO:', dto);
      // Получаем IPN secret из env
      const secret = cfg.onepayIpnSecret;
      if (!secret) throw 'NOWPayments IPN secret not found';

      // Рекурсивная сортировка объекта по ключам
      function sortObject(obj) {
        if (obj === null || typeof obj !== 'object' || Array.isArray(obj))
          return obj;
        const sorted = {};
        Object.keys(obj)
          .sort()
          .forEach((key) => {
            sorted[key] = sortObject(obj[key]);
          });
        return sorted;
      }
      const sortedDto = sortObject(dto);
      const payloadJson = JSON.stringify(sortedDto);
      const computedSignature = crypto
        .createHmac('sha512', secret)
        .update(payloadJson)
        .digest('hex');
      console.log('COMPUTED SIGNATURE:', computedSignature);
      console.log('RECEIVED SIGNATURE:', signature);
      if (computedSignature !== signature) throw 'invalid signature';

      // Проверяем успешный статус платежа
      if (dto.payment_status === 'finished') {
        // ищем заказ по outer_id (order_id в dto)
        const outorder = await this.dataSource
          .getRepository(COutorder)
          .findOne({ where: { id: dto.order_id } });
        if (!outorder) throw 'inorder not found';
        outorder.amount = Number(dto.pay_amount) || 0;
        outorder.completed = true;
        await this.dataSource.getRepository(COutorder).save(outorder);

        // обновляем юзера
        const user = await this.dataSource.getRepository(CUser).findOne({
          where: { email: outorder.user_email },
          relations: ['referrer'],
        });
        if (!user) throw 'user not found';

        const currentUserSubType = user.subType;
        const tariff = await this.dataSource.getRepository(CTariff).findOne({
          where: { id: outorder.tariff_id },
          relations: ['translations'],
        });
        if (!tariff) return 'fail';
        let promocode: CPromocode = null;

        if (outorder.promocode) {
          promocode = await this.dataSource
            .getRepository(CPromocode)
            .findOneBy({ code: outorder.promocode });
          if (!this.promocodesService.check(promocode)) return 'fail';
        }

        if (outorder.subType) {
          user.subType = outorder.subType as 'dg-pro' | 'dg-team';
        }

        if (tariff.type === 'subscription') {
          // subscription
          const now = new Date();

          user.paid_at = now;

          if (!user.paid_until || user.paid_until.getTime() < now.getTime()) {
            user.paid_until = new Date();
          }

          if (
            user.paid_until.getTime() >= now.getTime() &&
            currentUserSubType !== 'dg-team' &&
            user.subType === 'dg-team'
          )
            user.children_limit += 15;

          user.paid_until.setDate(user.paid_until.getDate() + tariff.period);

          if (!user.tg_invite) user.tg_invite = await this.buildInviteLink();

          if (user.subscribed) {
            this.mailService.userSubscription(user);
          }
        }

        if (tariff.type === 'onetime') {
          // one-time purchase
          if (tariff.code === 'subacc') {
            // children limit increasion
            user.children_limit += outorder.qty;
          }
        }

        await this.dataSource.getRepository(CUser).save(user);

        // update promocode
        if (promocode?.limit === 'activation') {
          promocode.activation_limit--;
          await this.dataSource.getRepository(CPromocode).save(promocode);
        }

        await this.dataSource.getRepository(CUser).save(user);
        this.socketGateway.broadcast({ event: `user:reload:${user.id}` });

        // переводим откат рефереру, если есть
        const referrer = user.referrer;
        if (referrer && referrer.active && referrer.referral_percent) {
          const otkat = parseFloat(
            ((outorder.amount / 100) * referrer.referral_percent).toFixed(),
          );
          referrer.money += otkat;
          await this.dataSource.getRepository(CUser).save(referrer);
          const reforder = this.dataSource.getRepository(CReforder).create({
            referrer_email: referrer.email,
            referee_email: user.email,
            amount: otkat,
            order_id: outorder.id,
            type: 'shoporder',
          });
          await this.dataSource.getRepository(CReforder).save(reforder);
          this.socketGateway.broadcast({ event: `user:reload:${referrer.id}` });
        }
      }

      console.log(`nowpayments-ipn-ok ${new Date()}`);
      return 'ok';
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CInordersService.complete',
        err,
      );
    }
  }
}
