import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CAppService } from 'src/common/services/app.service';
import { CErrorsService } from 'src/common/services/errors.service';
import { CGuide } from 'src/model/entities/guide';
import { CTask } from 'src/model/entities/task';
import { DataSource, In } from 'typeorm';
import * as util from 'util';

// операции с гайдами
@Injectable()
export class CGuidesAutoService {
  constructor(
    private dataSource: DataSource,
    private appService: CAppService,
    private errorsService: CErrorsService,
  ) {}

  // обновление цен с учетом дедлайнов тасков
  @Cron('0 * * * * *')
  private async updatePricesAndTime(): Promise<void> {
    try {
      const now = new Date();
      const strNow = this.appService.mysqlDate(new Date(), 'datetime');
      const deadTasks = await this.dataSource
        .getRepository(CTask)
        .createQueryBuilder('tasks')
        .where(`actual_until<='${strNow}'`)
        .getMany();
      const guide_ids = this.appService.arrayUnique(
        deadTasks.map((t) => t.guide_id),
      );
      const guides = await this.dataSource
        .getRepository(CGuide)
        .find({ where: { id: In(guide_ids) }, relations: ['tasks'] });
      //console.log(util.inspect(guides, {showHidden: false, depth: null, colors: true}));

      for (const guide of guides) {
        const price = guide.tasks
          .filter(
            (t) =>
              t.type === 'main' &&
              (t.actual_until === null ||
                t.actual_until.getTime() > now.getTime()),
          )
          .reduce((acc, t) => acc + t.price, 0);
        const time = guide.tasks
          .filter(
            (t) =>
              t.type === 'main' &&
              (t.actual_until === null ||
                t.actual_until.getTime() > now.getTime()),
          )
          .reduce((acc, t) => acc + t.time, 0);
        await this.dataSource
          .getRepository(CGuide)
          .update({ id: guide.id }, { price, time });
      }
    } catch (err) {
      await this.errorsService.log(
        'CGuidesAutoService.updatePricesAndTime',
        err,
      );
    }
  }
}
