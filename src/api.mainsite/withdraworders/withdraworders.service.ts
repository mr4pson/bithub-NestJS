import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { CMailService } from 'src/common/services/mailable/mail.service';
import { IResponse } from 'src/model/dto/response.interface';
import { CAdmin } from 'src/model/entities/admin';
import { CUser } from 'src/model/entities/user';
import { CWithdraworder } from 'src/model/entities/withdraworder';
import { CSocketGateway } from 'src/socket/socket.gateway';
import { DataSource } from 'typeorm';
import { IWithdraworderCreate } from './dto/withdraworder.create.interface';

@Injectable()
export class CWithdrawordersService {
  constructor(
    private dataSource: DataSource,
    private errorsService: CErrorsService,
    protected mailService: CMailService,
    private socketGateway: CSocketGateway,
  ) {}

  public async create(
    user_id: number,
    dto: IWithdraworderCreate,
  ): Promise<IResponse<string>> {
    try {
      if (dto.amount < 100) {
        return { statusCode: 400, error: 'Withdrawal amount is too small' };
      }

      const user = await this.dataSource
        .getRepository(CUser)
        .findOne({ where: { id: user_id } });
      const withdraworder = this.dataSource
        .getRepository(CWithdraworder)
        .create({
          email: user.email,
          tg: dto.tg,
          amount: dto.amount,
          wallet: dto.wallet,
          comment: dto.comment,
          completed: false,
        });
      const createdOrder = await this.dataSource
        .getRepository(CWithdraworder)
        .save(withdraworder);

      if (user.money < dto.amount) {
        return { statusCode: 400, error: 'Insufficient balance amount' };
      }

      user.money = user.money - dto.amount;

      await this.dataSource.getRepository(CUser).save(user);
      await this.notifyOnCreate(createdOrder);

      this.socketGateway.broadcast({ event: `user:reload:${user.id}` });

      return { statusCode: 201 };
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

  private async notifyOnCreate(withdraworder: CWithdraworder): Promise<void> {
    try {
      const admins = await this.dataSource
        .getRepository(CAdmin)
        .find({ where: { active: true, hidden: false, group_id: 1 } }); // только владельцам

      for (const admin of admins) {
        await this.mailService.adminWithdraworder(admin.email, withdraworder);
      }
    } catch (err) {
      await this.errorsService.log(
        'api.mainsite/CShopordersService.notifyOnCreate',
        err,
      );
    }
  }
}
