import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { CUser } from 'src/model/entities/user';
import { DataSource, IsNull, Not } from 'typeorm';
import { IResponse } from 'src/model/dto/response.interface';
import { CAppService } from 'src/common/services/app.service';
import { IStatUsersMonthly } from './dto/stat.users.monthly.interface';
import { CCat } from 'src/model/entities/cat';
import { IStatCat, IStatCats } from './dto/stat.cats.interface';
import { CGuide } from 'src/model/entities/guide';
import { CInorder } from 'src/model/entities/inorder';
import { IStatTotals } from './dto/stat.totals.interface';
import { CTask } from 'src/model/entities/task';

@Injectable()
export class CStatsService {
  constructor(
    private dataSource: DataSource,
    private appService: CAppService,
    private errorsService: CErrorsService,
  ) {}

  public async usersMonthly({
    from,
    to,
  }: {
    from: string;
    to: string;
  }): Promise<IResponse<IStatUsersMonthly>> {
    try {
      const data: IStatUsersMonthly = {
        users: [],
        supers: [],
        subs: [],
      };

      // format incoming timestamps (Date.valueOf()) to SQL datetime strings
      const fromDate = new Date(Number(from));
      const toDate = new Date(Number(to));
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          '0',
        )}-${String(d.getDate()).padStart(2, '0')} ${String(
          d.getHours(),
        ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(
          d.getSeconds(),
        ).padStart(2, '0')}`;

      // iterate month-by-month from fromDate to toDate (inclusive)
      const startYear = fromDate.getFullYear();
      const startMonth = fromDate.getMonth(); // 0-based
      const endYear = toDate.getFullYear();
      const endMonth = toDate.getMonth();

      let y = startYear;
      let m = startMonth;
      while (y < endYear || (y === endYear && m <= endMonth)) {
        const daysInMonth = this.appService.daysInMonth(m, y);
        const monthStart = new Date(y, m, 1, 0, 0, 0, 0);
        const monthEnd = new Date(y, m, daysInMonth, 23, 59, 59, 999);

        // clamp by requested from/to
        const monthFrom = monthStart < fromDate ? fromDate : monthStart;
        const monthTo = monthEnd > toDate ? toDate : monthEnd;

        const dateFilterMonth = `users.created_at >= '${fmt(
          monthFrom,
        )}' AND users.created_at <= '${fmt(monthTo)}'`;

        const users = await this.dataSource
          .getRepository(CUser)
          .createQueryBuilder('users')
          .where(dateFilterMonth)
          .getCount();
        const supers = await this.dataSource
          .getRepository(CUser)
          .createQueryBuilder('users')
          .where(`${dateFilterMonth} AND users.parent_id IS NULL`)
          .getCount();
        const subs = await this.dataSource
          .getRepository(CUser)
          .createQueryBuilder('users')
          .where(`${dateFilterMonth} AND users.parent_id IS NOT NULL`)
          .getCount();

        // push objects with month, year and value
        data.users.push({ year: y, month: m + 1, value: users });
        data.supers.push({ year: y, month: m + 1, value: supers });
        data.subs.push({ year: y, month: m + 1, value: subs });

        // advance month
        m++;
        if (m > 11) {
          m = 0;
          y++;
        }
      }

      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.owner/CStatsService.usersMonthly',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async cats(): Promise<IResponse<IStatCats>> {
    try {
      const cats = await this.dataSource
        .getRepository(CCat)
        .find({ relations: ['translations'] });
      const statCats: IStatCat[] = [];

      for (const cat of cats) {
        const q = await this.dataSource
          .getRepository(CGuide)
          .count({ where: { cat_id: cat.id } });

        if (q) {
          const name = cat.translations.find((t) => t.lang_id === 1).name;
          statCats.push({ name, q, percent: 0 });
        }
      }

      const total = statCats.reduce((acc, x) => acc + x.q, 0);

      if (statCats.length) {
        let acc = 0;

        for (let i = 0; i < statCats.length; i++) {
          // мы округляем проценты, но сумма может не сойтись, поэтому последний процент получим как 100 минус предыдущие
          statCats[i].percent =
            i < statCats.length - 1
              ? Math.round((statCats[i].q * 100) / total)
              : 100 - acc;
          acc += statCats[i].percent;
        }

        statCats.sort((a, b) => b.percent - a.percent);
      }

      const data = { cats: statCats, total };
      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.owner/CStatsService.cats',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async inordersMonthly(year: number): Promise<IResponse<number[]>> {
    try {
      const data: number[] = [];

      for (let month = 0; month < 12; month++) {
        const daysInMonth = this.appService.daysInMonth(month, year);
        const filter = `inorders.created_at >= '${year}-${
          month + 1
        }-01 00:00:00.000000' AND inorders.created_at <= '${year}-${
          month + 1
        }-${daysInMonth} 23:59:59.999999' AND inorders.completed = '1'`;
        const inorders = await this.dataSource
          .getRepository(CInorder)
          .createQueryBuilder('inorders')
          .where(filter)
          .getMany();
        const amount = inorders.reduce((acc, x) => acc + x.received_amount, 0);
        data.push(amount);
      }

      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.owner/CStatsService.inordersMonthly',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async totals(): Promise<IResponse<IStatTotals>> {
    try {
      const users = await this.dataSource.getRepository(CUser).count();
      const supers = await this.dataSource
        .getRepository(CUser)
        .count({ where: { parent_id: IsNull() } });
      const subs = await this.dataSource
        .getRepository(CUser)
        .count({ where: { parent_id: Not(IsNull()) } });
      const inorders_q = await this.dataSource
        .getRepository(CInorder)
        .count({ where: { completed: true } });
      const inorders_amount =
        (
          await this.dataSource
            .getRepository(CInorder)
            .createQueryBuilder('inorders')
            .select('SUM(inorders.received_amount)', 'total_amount')
            .where("inorders.completed='1'")
            .getRawOne()
        )['total_amount'] || 0;
      const guides = await this.dataSource.getRepository(CGuide).count();
      const tasks = await this.dataSource.getRepository(CTask).count();
      const data = {
        users,
        supers,
        subs,
        inorders_q,
        inorders_amount,
        guides,
        tasks,
      };
      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.owner/CStatsService.totals',
        err,
      );
      return { statusCode: 500, error };
    }
  }
}
