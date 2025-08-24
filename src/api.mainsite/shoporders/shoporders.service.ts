import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { DataSource } from 'typeorm';
import { IShoporderCreate } from './dto/shoporder.create.interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CShoporder } from 'src/model/entities/shoporder';
import { CUser } from 'src/model/entities/user';
import { CAdmin } from 'src/model/entities/admin';
import { CMailService } from 'src/common/services/mailable/mail.service';
import { cfg } from 'src/app.config';
import { INowPaymentsPayment } from '../inorders/dto';
import { CNetworkService } from 'src/common/services/network.service';
import { CSocketGateway } from 'src/socket/socket.gateway';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require('crypto');

@Injectable()
export class CShopordersService {
  constructor(
    private dataSource: DataSource,
    private networkService: CNetworkService,
    private errorsService: CErrorsService,
    protected mailService: CMailService,
    private socketGateway: CSocketGateway,
  ) {}

  public async create(
    user_id: number,
    dto: IShoporderCreate,
  ): Promise<IResponse<string>> {
    try {
      const user = await this.dataSource
        .getRepository(CUser)
        .findOne({ where: { id: user_id } });
      const shoporder = this.dataSource.getRepository(CShoporder).create({
        email: user.email,
        tg: dto.tg,
        comment: dto.comment,
        status: 'created',
      });
      // Сохраняем заказ, чтобы получить id
      const createdOrder = await this.dataSource
        .getRepository(CShoporder)
        .save(shoporder);
      // Создаём позиции заказа
      for (const item of dto.items) {
        await this.dataSource.getRepository('CShoporderItem').save({
          shoporder_id: createdOrder.id,
          shopitem_id: item.shopitem_id,
          qty: item.qty,
        });
      }

      const updatedShoporder = await this.dataSource
        .getRepository(CShoporder)
        .findOne({
          where: { id: createdOrder.id },
          relations: ['items', 'items.shopitem', 'items.shopitem.translations'],
        });

      const totalPrice = updatedShoporder.items.reduce(
        (acc, item) => acc + item.shopitem.price * item.qty,
        0,
      );

      if (user.money >= totalPrice) {
        user.money -= totalPrice;
        createdOrder.status = 'paid';

        await this.dataSource.getRepository(CShoporder).save(createdOrder);
        await this.dataSource.getRepository(CUser).save(user);
        this.socketGateway.broadcast({ event: `user:reload:${user.id}` });

        return { statusCode: 201 };
      }

      const url = await this.nowPaymentsCreatePayment(
        updatedShoporder,
        dto.lang_slug,
        totalPrice,
      );

      this.notifyOnCreate(updatedShoporder);

      return { statusCode: 201, data: url };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CShopordersService.create',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  /////////////////
  // utils
  /////////////////

  private async notifyOnCreate(shoporder: CShoporder): Promise<void> {
    try {
      const admins = await this.dataSource
        .getRepository(CAdmin)
        .find({ where: { active: true, hidden: false, group_id: 1 } }); // только владельцам

      for (const admin of admins) {
        await this.mailService.adminShoporder(admin.email, shoporder);
      }
    } catch (err) {
      await this.errorsService.log(
        'api.mainsite/CShopordersService.notifyOnCreate',
        err,
      );
    }
  }

  private async nowPaymentsCreatePayment(
    shoporder: CShoporder,
    langSlug: string,
    totalPrice: number,
  ) {
    const url = 'https://api.nowpayments.io/v1/invoice';
    const payload = {
      price_amount: totalPrice,
      price_currency: 'usd',
      order_id: shoporder.id,
      order_description: 'User topup',
      ipn_callback_url: `${cfg.backUrl}/api/mainsite/shoporders/complete`,
      success_url: `${cfg.mainsiteUrl}/${langSlug}/payment-success`,
      cancel_url: `${cfg.mainsiteUrl}/${langSlug}/payment-fail`,
    };
    const headers = { 'x-api-key': cfg.onepayApiKey };
    const res = await this.networkService.post(url, payload, { headers });
    const paymentData = res.data as INowPaymentsPayment;

    console.log('shoporder payment created', res.data);

    shoporder.outer_id = paymentData.id;
    await this.dataSource.getRepository(CShoporder).save(shoporder);

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
        const shoporder = await this.dataSource
          .getRepository(CShoporder)
          .findOne({ where: { id: dto.order_id } });
        if (!shoporder) throw 'shoporder not found';
        shoporder.status = 'paid';
        await this.dataSource.getRepository(CShoporder).save(shoporder);
      }
      console.log(`nowpayments-ipn-ok ${new Date()}`);
      return 'ok';
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CShopordersService.complete',
        err,
      );
    }
  }
}
