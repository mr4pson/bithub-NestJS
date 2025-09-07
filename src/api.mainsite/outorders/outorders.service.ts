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

@Injectable()
export class COutordersService {
  constructor(
    private dataSource: DataSource,
    private errorsService: CErrorsService,
    private promocodesService: CPromocodesService,
    private mailService: CMailService,
    private tgapiService: CTgApiService,
  ) {}

  public async create(
    dto: IOutorderCreate,
    user_id: number,
  ): Promise<IResponse<void>> {
    try {
      const user = await this.dataSource
        .getRepository(CUser)
        .findOne({ where: { id: user_id, active: true } });
      if (!user) return { statusCode: 404, error: 'user not found' };
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
      if (amount > user.money)
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
      });
      await this.dataSource.getRepository(COutorder).save(outorder);

      // update user
      user.money -= amount;

      if (tariff.type === 'subscription') {
        // subscription
        const now = new Date();
        user.paid_at = now;
        if (!user.paid_until || user.paid_until.getTime() < now.getTime())
          user.paid_until = new Date();
        user.paid_until.setDate(user.paid_until.getDate() + tariff.period);
        if (!user.tg_invite) user.tg_invite = await this.buildInviteLink();
        this.mailService.userSubscription(user);
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
}
