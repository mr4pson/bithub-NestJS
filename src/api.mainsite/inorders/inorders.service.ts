import { Injectable } from '@nestjs/common';
import { cfg } from 'src/app.config';
import { CErrorsService } from 'src/common/services/errors.service';
import { CNetworkService } from 'src/common/services/network.service';
import { IResponse } from 'src/model/dto/response.interface';
import { CInorder } from 'src/model/entities/inorder';
import { CReforder } from 'src/model/entities/reforder';
import { CUser } from 'src/model/entities/user';
import { CSocketGateway } from 'src/socket/socket.gateway';
import { DataSource } from 'typeorm';
import { INowPaymentsPayment } from './dto';
import { IInorderCreate } from './dto/inorder.create.interface';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require('crypto');

@Injectable()
export class CInordersService {
  constructor(
    private errorsService: CErrorsService,
    private networkService: CNetworkService,
    private socketGateway: CSocketGateway,
    private dataSource: DataSource,
  ) {}

  public async create(
    dto: IInorderCreate,
    user_id: number,
  ): Promise<IResponse<string>> {
    try {
      const user = await this.dataSource
        .getRepository(CUser)
        .findOne({ where: { id: user_id, active: true } });

      if (!user) return { statusCode: 404, error: 'user not found' };

      const inorder = this.dataSource.getRepository(CInorder).create({
        user_email: user.email,
        expected_amount: dto.amount,
      });

      await this.dataSource.getRepository(CInorder).save(inorder);

      const url = await this.nowPaymentsCreatePayment(inorder, dto.lang_slug);

      return { statusCode: 201, data: url };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CInordersService.create',
        err,
      );

      return { statusCode: 500, error };
    }
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
        const inorder = await this.dataSource
          .getRepository(CInorder)
          .findOne({ where: { id: dto.order_id } });
        if (!inorder) throw 'inorder not found';
        inorder.received_amount = Number(dto.pay_amount) || 0;
        inorder.completed = true;
        await this.dataSource.getRepository(CInorder).save(inorder);

        // обновляем юзера
        const user = await this.dataSource.getRepository(CUser).findOne({
          where: { email: inorder.user_email },
          relations: ['referrer'],
        });
        if (!user) throw 'user not found';
        user.money += inorder.received_amount;
        await this.dataSource.getRepository(CUser).save(user);
        this.socketGateway.broadcast({ event: `user:reload:${user.id}` });

        // переводим откат рефереру, если есть
        const referrer = user.referrer;
        if (referrer && referrer.active && referrer.referral_percent) {
          const otkat = parseFloat(
            (
              (inorder.received_amount / 100) *
              referrer.referral_percent
            ).toFixed(),
          );
          referrer.money += otkat;
          await this.dataSource.getRepository(CUser).save(referrer);

          const reforder = this.dataSource.getRepository(CReforder).create({
            referrer_email: referrer.email,
            referee_email: user.email,
            amount: otkat,
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

  /////////////////
  // utils
  /////////////////

  private async nowPaymentsCreatePayment(inorder: CInorder, langSlug: string) {
    const url = 'https://api.nowpayments.io/v1/invoice';
    const payload = {
      price_amount: inorder.expected_amount,
      price_currency: 'usd',
      order_id: inorder.id,
      order_description: 'User topup',
      ipn_callback_url: `${cfg.backUrl}/api/mainsite/inorders/complete`,
      success_url: `${cfg.mainsiteUrl}/${langSlug}/payment-success`,
      cancel_url: `${cfg.mainsiteUrl}/${langSlug}/payment-fail`,
    };
    const headers = { 'x-api-key': cfg.onepayApiKey };
    const res = await this.networkService.post(url, payload, { headers });
    const paymentData = res.data as INowPaymentsPayment;

    console.log('payment created', res.data);

    inorder.outer_id = paymentData.id;
    await this.dataSource.getRepository(CInorder).save(inorder);

    return paymentData.invoice_url;
  }
}
