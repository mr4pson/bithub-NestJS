import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CAppService } from 'src/common/services/app.service';
import { CErrorsService } from 'src/common/services/errors.service';
import { CDailer } from 'src/model/entities/dailer';
import { CUser } from 'src/model/entities/user';
import { timezones } from 'src/model/tz';
import { DataSource, In } from 'typeorm';

// ежедневные задачи
@Injectable()
export class CDailersAutoService {
  constructor(
    private dataSource: DataSource,
    private appService: CAppService,
    private errorsService: CErrorsService,
  ) {}

  // reset completion mark for daily tasks
  @Cron('0 */15 * * * *') // every 15 minute (because we have timezones with 15'-offset)
  private async resetCompletion(): Promise<void> {
    try {
      // for which timezone now is 0:00?
      const tz = timezones.find((tz) => {
        const now = this.appService.utcToLocal(new Date(), tz.offset);
        return !now.getHours() && !now.getMinutes(); // === 0:00
      });
      if (!tz) return;
      // users with this timezone
      const users = await this.dataSource
        .getRepository(CUser)
        .find({ where: { tz: tz.offset, active: true } });
      const user_ids = users.map((u) => u.id);
      // reset "dailers" completion for users
      await this.dataSource
        .getRepository(CDailer)
        .update({ user_id: In(user_ids) }, { completed: false });
    } catch (err) {
      await this.errorsService.log('CDailersAutoService.resetCompletion', err);
    }
  }
}
