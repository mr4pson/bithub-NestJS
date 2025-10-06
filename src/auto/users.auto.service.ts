import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CAppService } from 'src/common/services/app.service';
import { CErrorsService } from 'src/common/services/errors.service';
import { CMailService } from 'src/common/services/mailable/mail.service';
import { CTgBotService } from 'src/common/services/mailable/tg.bot.service';
import { CCompletion } from 'src/model/entities/completion';
import { CInorder } from 'src/model/entities/inorder';
import { CPromocode } from 'src/model/entities/promocode';
import { CSetting } from 'src/model/entities/setting';
import { CTask } from 'src/model/entities/task';
import { CUser } from 'src/model/entities/user';
import { DataSource } from 'typeorm';
import { timezones } from 'src/model/tz';
import { CDatemark } from 'src/model/entities/datemark';

// взаимодействие с пользователями
@Injectable()
export class CUsersAutoService {
  constructor(
    private dataSource: DataSource,
    private errorsService: CErrorsService,
    private appService: CAppService,
    private mailService: CMailService,
    private tgBotService: CTgBotService,
  ) {}

  // сброс счетчика бесплатных просмотров через некоторое количество дней
  @Cron('0 0 0 * * *') // every day at 0:00
  private async resetFreetasksCounters(): Promise<void> {
    try {
      const sTimeout = (
        await this.dataSource
          .getRepository(CSetting)
          .findOne({ where: { p: 'site-reset-freetask-timeout' } })
      )?.v;
      if (!sTimeout) return;
      const timeout = parseInt(sTimeout);
      const datelimit = new Date();
      datelimit.setDate(datelimit.getDate() - timeout);
      await this.dataSource
        .getRepository(CUser)
        .createQueryBuilder()
        .update({ freetasks: 0 })
        .where(
          `freetasks > 0 AND (freetask_viewed_at IS NULL OR freetask_viewed_at < '${this.appService.mysqlDate(
            datelimit,
          )}')`,
        )
        .execute();
    } catch (err) {
      await this.errorsService.log(
        'CUsersAutoService.resetFreetasksCounters',
        err,
      );
    }
  }

  // Крон-задача: сбрасывает subType у пользователей с истекшей подпиской
  @Cron('0 0 * * * *') // каждый час
  private async resetSubTypeForExpiredUsers(): Promise<void> {
    try {
      const now = new Date();
      const users = await this.dataSource
        .getRepository(CUser)
        .createQueryBuilder('users')
        .where(
          `users.active='1' AND users.paid_until IS NOT NULL AND users.paid_until < '${this.appService.mysqlDate(
            now,
            'datetime',
          )}' AND users.subType IS NOT NULL`,
        )
        .getMany();

      if (!users.length) return;

      for (const user of users) {
        user.subType = null;
        await this.dataSource.getRepository(CUser).save(user);
      }
    } catch (err) {
      await this.errorsService.log(
        'CUsersAutoService.resetSubTypeForExpiredUsers',
        err,
      );
    }
  }

  // письма с напоминанием пользователям, которые зарегистрировались, но никогда не покупали подписок
  @Cron('0 0 0 * * *') // every day 0:00 UTC
  private async noSubscriptionReminder(): Promise<void> {
    try {
      const sEnabled = (
        await this.dataSource
          .getRepository(CSetting)
          .findOne({ where: { p: 'site-nosubs-reminder' } })
      )?.v;
      const sTimeout = (
        await this.dataSource
          .getRepository(CSetting)
          .findOne({ where: { p: 'site-nosubs-reminder-timeout' } })
      )?.v; // через сколько дней после регистрации человек получит письмо
      const timeout = sTimeout ? parseInt(sTimeout) : 7; // если нет параметра, то 7 дней

      if (sEnabled !== '1') {
        return;
      }

      const now = new Date();
      const from = new Date(now);
      const to = new Date(now);
      from.setDate(from.getDate() - timeout);
      to.setDate(to.getDate() - (timeout - 1));
      // пользователи за тот день
      const filter = `users.active='1' AND users.paid_until IS NULL AND users.created_at >= '${this.appService.mysqlDate(
        from,
        'datetime',
      )}' AND users.created_at < '${this.appService.mysqlDate(
        to,
        'datetime',
      )}'`;
      const users = await this.dataSource
        .getRepository(CUser)
        .createQueryBuilder('users')
        .where(filter)
        .getMany();

      // рассылаем рекламу
      for (const user of users) {
        if (!user.subscribed) continue; // если отписан от рассылки, не шлем
        await this.mailService.userNosubscriptionReminder(user);
        await this.appService.pause(60000); // тут пока ставим одно письмо в минуту, zoho-почта блокирует спам
      }
    } catch (err) {
      await this.errorsService.log(
        'CUsersAutoService.noSubscriptionReminder',
        err,
      );
    }
  }

  // письма с промокодом пользователям, которые зарегистрировались, но никогда не покупали подписок
  @Cron('0 0 0 * * *') // every day 0:00 UTC
  private async noSubscriptionPromo(): Promise<void> {
    try {
      const sEnabled = (
        await this.dataSource
          .getRepository(CSetting)
          .findOne({ where: { p: 'site-nosubs-promo' } })
      )?.v;
      const sDiscount = (
        await this.dataSource
          .getRepository(CSetting)
          .findOne({ where: { p: 'site-nosubs-promo-discount' } })
      )?.v;
      const discount = sDiscount ? parseInt(sDiscount) : 20; // если нет параметра, то 20%
      const sTimeout = (
        await this.dataSource
          .getRepository(CSetting)
          .findOne({ where: { p: 'site-nosubs-promo-timeout' } })
      )?.v; // через сколько дней после регистрации человек получит письмо
      const timeout = sTimeout ? parseInt(sTimeout) : 14; // если нет параметра, то 14 дней

      if (sEnabled !== '1') {
        return;
      }

      const now = new Date();
      const from = new Date(now);
      const to = new Date(now);
      from.setDate(from.getDate() - timeout);
      to.setDate(to.getDate() - (timeout - 1));
      // пользователи за тот день
      const filter = `users.active='1' AND users.paid_until IS NULL AND users.created_at >= '${this.appService.mysqlDate(
        from,
        'datetime',
      )}' AND users.created_at < '${this.appService.mysqlDate(
        to,
        'datetime',
      )}'`;
      const users = await this.dataSource
        .getRepository(CUser)
        .createQueryBuilder('users')
        .where(filter)
        .getMany();

      if (!users.length) {
        return;
      }

      // создаем промокод
      const plusWeek = new Date(now);
      plusWeek.setDate(plusWeek.getDate() + 7);
      const promocode = this.dataSource.getRepository(CPromocode).create({
        code: `start-${this.appService.randomString(6, 'lowercase')}`,
        discount,
        limit: 'date',
        date_limit: plusWeek,
      });
      await this.dataSource.getRepository(CPromocode).save(promocode);

      // рассылаем промокод
      for (const user of users) {
        if (!user.subscribed) continue; // если отписан от рассылки, не шлем
        await this.mailService.userNosubscriptionPromo(user, promocode);
        await this.appService.pause(60000); // тут пока ставим одно письмо в минуту, zoho-почта блокирует спам
      }
    } catch (err) {
      await this.errorsService.log(
        'CUsersAutoService.noSubscriptionPromo',
        err,
      );
    }
  }

  // письма пользователям, которые начали оплату, но не завершили ее (создали приходный ордер, и он остался с completed=false)
  @Cron('0 * * * * *') // every minute
  private async nopay(): Promise<void> {
    try {
      const sEnabled = (
        await this.dataSource
          .getRepository(CSetting)
          .findOne({ where: { p: 'site-nopay-reminder' } })
      )?.v;
      const sTimeout = (
        await this.dataSource
          .getRepository(CSetting)
          .findOne({ where: { p: 'site-nopay-reminder-timeout' } })
      )?.v; // через сколько минут после попытки оплаты человек получит письмо
      const timeout = sTimeout ? parseInt(sTimeout) : 60; // если нет параметра, то 60 минут

      if (sEnabled !== '1') {
        return;
      }

      const from = new Date();
      const to = new Date();
      from.setMinutes(from.getMinutes() - timeout);
      to.setMinutes(to.getMinutes() - (timeout - 1));
      // незавершенные ордеры за ту минуту
      const filter = `inorders.completed='0' AND inorders.created_at >= '${this.appService.mysqlDate(
        from,
        'datetime',
      )}' AND inorders.created_at < '${this.appService.mysqlDate(
        to,
        'datetime',
      )}'`;
      const inorders = await this.dataSource
        .getRepository(CInorder)
        .createQueryBuilder('inorders')
        .where(filter)
        .getMany();

      for (const inorder of inorders) {
        const user = await this.dataSource
          .getRepository(CUser)
          .findOne({ where: { email: inorder.user_email, active: true } });
        if (!user || !user.subscribed) continue;
        await this.mailService.userNopayReminder(user);
        await this.appService.pause(60000); // тут пока ставим одно письмо в минуту, zoho-почта блокирует спам
      }
    } catch (err) {
      await this.errorsService.log('CUsersAutoService.nopay', err);
    }
  }

  // сообщения в телеграм о дедлайнах в избранных тасках
  @Cron('0 * * * * *') // every minute
  private async deadlines(): Promise<void> {
    try {
      const now = new Date();
      const date = new Date();
      date.setHours(date.getHours() + 48); // за 48 часов до
      // таски с дедлайном
      const tasks = await this.dataSource
        .getRepository(CTask)
        .createQueryBuilder('tasks')
        .leftJoinAndSelect('tasks.translations', 'task_translations')
        .leftJoinAndSelect('tasks.guide', 'guide')
        .leftJoinAndSelect('guide.translations', 'guide_translations')
        .where(
          `guide.active='1' AND tasks.actual_until='${this.appService.mysqlDate(
            date,
            'datetime',
          )}'`,
        )
        .getMany();

      for (const task of tasks) {
        // юзеры, у которых этот гайд в избранном, есть подписка на уведомления и оплачен тариф
        const filter = `users.active = '1' AND users.tg_id IS NOT NULL AND users.tg_active = '1' AND users.tg_deadlines = '1' AND users.paid_until IS NOT NULL AND users.paid_until > '${this.appService.mysqlDate(
          now,
          'datetime',
        )}' AND favoritions.guide_id = '${task.guide_id}'`;
        const users = await this.dataSource
          .getRepository(CUser)
          .createQueryBuilder('users')
          .leftJoin('users.favoritions', 'favoritions')
          .leftJoinAndSelect('users.lang', 'lang')
          .where(filter)
          .getMany();

        for (const user of users) {
          // выполнен ли этот таск юзером?
          const completion = await this.dataSource
            .getRepository(CCompletion)
            .findOne({ where: { user_id: user.id, task_id: task.id } });
          // выполнен
          if (completion) continue;
          // не выполнен - отправляем сообщение
          await this.appService.pause(100); // не больше 30 сообщений в секунду, возьмем с запасом - 10 в секунду
          await this.tgBotService.userDeadline(user, task);
        }
      }
    } catch (err) {
      await this.errorsService.log('CUsersAutoService.deadlines', err);
    }
  }

  // напоминания о гайдах (подписка из календариков)
  // в объекте CDatemark юзеры пишут дату без времени (YYYY-MM-DD)
  // напоминаем в 8:00 по времени каждого пользователя, т.е. напоминалка сработает в YYYY-MM-DD 08:00:00 в поясе пользователя
  private dmRemindHour = 8;
  private dmRemindMinute = 0;

  @Cron('0 */15 * * * *') // каждые 15 минут (т.к. минимальное различие в зонах - 15 минут)
  private async dmRemind(): Promise<void> {
    try {
      const now = new Date();

      // перебираем таймзон-офсеты, для которых сейчас время напоминания (8:00)
      for (const timezone of timezones) {
        const offset = timezone.offset;
        const targetTime = this.appService.utcToLocal(now, offset);
        if (
          targetTime.getHours() !== this.dmRemindHour ||
          targetTime.getMinutes() !== this.dmRemindMinute
        )
          continue;
        // какая дата сейчас у юзеров с таким офсетом?
        const userDate = this.appService.mysqlDate(
          this.appService.utcToLocal(now, offset),
        );
        // дейтмарки-напоминалки, которые пора отправлять
        const datemarks = await this.dataSource
          .getRepository(CDatemark)
          .createQueryBuilder('datemarks')
          .leftJoinAndSelect('datemarks.user', 'user')
          .leftJoinAndSelect('user.lang', 'lang')
          .leftJoinAndSelect('datemarks.guide', 'guide')
          .leftJoinAndSelect('guide.translations', 'guide_translations')
          // в терминах этого сайта tz юзера - это timezone offset
          // доступно только для юзеров с поалченным тарифом
          .where(
            `datemarks.date='${userDate}' AND datemarks.type='reminder' AND user.active='1' AND user.tg_active='1' AND user.tz='${offset}' AND user.paid_until IS NOT NULL AND user.paid_until > '${this.appService.mysqlDate(
              now,
              'datetime',
            )}'`,
          )
          .getMany();

        for (const d of datemarks) {
          await this.tgBotService.userGuideReminder(d.user, d.guide);
          await this.dataSource.getRepository(CDatemark).remove(d); // удаляем после отправки
          await this.appService.pause(100); // не больше 30 сообщений в секунду, возьмем с запасом - 10 в секунду
        }
      }
    } catch (err) {
      await this.errorsService.log('CUsersAutoService.dmRemind', err);
    }
  }

  /*
    // предупреждения об окончании подписки за 7 и 2 дня
    @Cron("0 * * * * *")
    private async subscriptionEnds(): Promise<void> {
        try {
            for (const before of [7, 2]) {
                const from = new Date();
                from.setDate(from.getDate() + before);
                const to = new Date(from);
                to.setMinutes(to.getMinutes() + 1);
                const strFrom = this.appService.mysqlDate(from, "datetime");
                const strTo = this.appService.mysqlDate(to, "datetime");
                const users = await this.dataSource
                    .getRepository(CUser)
                    .createQueryBuilder("users")
                    .where(`users.active='1' AND users.paid_until >= '${strFrom}' AND users.paid_until < '${strTo}'`)
                    .getMany();

                for (const user of users) {
                    await this.mailService.userSubscriptionEnds(user);
                }
            }
        } catch (err) {
            await this.errorsService.log("CUsersAutoService.subscriptionEnds", err);
        }
    }

    // подписка окончена (в предыдущую минуту) - удаляем из группы
    @Cron("0 * * * * *")
    private async subscriptionEnded(): Promise<void> {
        try {
            const from = new Date();
            const to = new Date(from);
            from.setMinutes(from.getMinutes() - 1);
            const strFrom = this.appService.mysqlDate(from, "datetime");
            const strTo = this.appService.mysqlDate(to, "datetime");
            const users = await this.dataSource
                .getRepository(CUser)
                .createQueryBuilder("users")
                .where(`users.active='1' AND users.paid_until >= '${strFrom}' AND users.paid_until < '${strTo}'`)
                .getMany();
            if (!users.length) return;
            const groupName = (await this.dataSource.getRepository(CSetting).findOneBy({p: "tgapi-group"}))?.v;
            if (!groupName) return;

            for (const user of users) {
                console.log(user);
            }
        } catch (err) {
            await this.errorsService.log("CUsersAutoService.subscriptionEnded", err);
        }
    }
    */
}
