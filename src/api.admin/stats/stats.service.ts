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
import { COutorder } from 'src/model/entities/outorder';

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

  public async mauByMonths({
    from,
    to,
  }: {
    from: string;
    to: string;
  }): Promise<IResponse<any>> {
    try {
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

      const startYear = fromDate.getFullYear();
      const startMonth = fromDate.getMonth();
      const endYear = toDate.getFullYear();
      const endMonth = toDate.getMonth();

      const months: { year: number; month: number; value: number }[] = [];

      let y = startYear;
      let m = startMonth;
      while (y < endYear || (y === endYear && m <= endMonth)) {
        const daysInMonth = this.appService.daysInMonth(m, y);
        const monthStart = new Date(y, m, 1, 0, 0, 0, 0);
        const monthEnd = new Date(y, m, daysInMonth, 23, 59, 59, 999);

        const monthFrom = monthStart < fromDate ? fromDate : monthStart;
        const monthTo = monthEnd > toDate ? toDate : monthEnd;

        const startStr = fmt(monthFrom);
        const endStr = fmt(monthTo);

        const q = `
          SELECT COUNT(DISTINCT user_id) AS mau FROM (
            SELECT user_id FROM a7_traffic WHERE user_id IS NOT NULL AND created_at >= ? AND created_at <= ?
            UNION ALL
            SELECT user_id FROM a7_viewings WHERE created_at >= ? AND created_at <= ?
            UNION ALL
            SELECT user_id FROM a7_readings WHERE created_at >= ? AND created_at <= ?
          ) t
        `;

        let res: any[] = [];
        try {
          res = await this.dataSource.query(q, [
            startStr,
            endStr,
            startStr,
            endStr,
            startStr,
            endStr,
          ]);
        } catch (e) {
          // on query error push zero for this month and continue
          months.push({ year: y, month: m + 1, value: 0 });
          // advance month
          m++;
          if (m > 11) {
            m = 0;
            y++;
          }
          continue;
        }

        const mau = Number(res[0]?.mau || 0);
        months.push({ year: y, month: m + 1, value: mau });

        // advance month
        m++;
        if (m > 11) {
          m = 0;
          y++;
        }
      }

      return { statusCode: 200, data: { months } };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.owner/CStatsService.mauByMonths',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async subscribersByMonths({
    from,
    to,
  }: {
    from: string;
    to: string;
  }): Promise<IResponse<any>> {
    try {
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

      const startYear = fromDate.getFullYear();
      const startMonth = fromDate.getMonth();
      const endYear = toDate.getFullYear();
      const endMonth = toDate.getMonth();

      const months: { year: number; month: number; value: number }[] = [];

      let y = startYear;
      let m = startMonth;
      while (y < endYear || (y === endYear && m <= endMonth)) {
        const daysInMonth = this.appService.daysInMonth(m, y);
        const monthStart = new Date(y, m, 1, 0, 0, 0, 0);
        const monthEnd = new Date(y, m, daysInMonth, 23, 59, 59, 999);

        const monthFrom = monthStart < fromDate ? fromDate : monthStart;
        const monthTo = monthEnd > toDate ? toDate : monthEnd;

        const dateFilterMonth = `outorders.created_at >= '${fmt(
          monthFrom,
        )}' AND outorders.created_at <= '${fmt(monthTo)}'`;

        let cnt = 0;
        try {
          cnt = await this.dataSource
            .getRepository(COutorder)
            .createQueryBuilder('outorders')
            .where(`${dateFilterMonth} AND outorders.subType IS NOT NULL`)
            .getCount();
        } catch (e) {
          // on error push zero and continue
          months.push({ year: y, month: m + 1, value: 0 });
          m++;
          if (m > 11) {
            m = 0;
            y++;
          }
          continue;
        }

        months.push({ year: y, month: m + 1, value: cnt });

        // advance month
        m++;
        if (m > 11) {
          m = 0;
          y++;
        }
      }

      return { statusCode: 200, data: { months } };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.owner/CStatsService.subscribersByMonths',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async outordersAvgAmountByMonths({
    from,
    to,
  }: {
    from: string;
    to: string;
  }): Promise<IResponse<any>> {
    try {
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

      const startYear = fromDate.getFullYear();
      const startMonth = fromDate.getMonth();
      const endYear = toDate.getFullYear();
      const endMonth = toDate.getMonth();

      const months: { year: number; month: number; value: number }[] = [];

      let y = startYear;
      let m = startMonth;
      while (y < endYear || (y === endYear && m <= endMonth)) {
        const daysInMonth = this.appService.daysInMonth(m, y);
        const monthStart = new Date(y, m, 1, 0, 0, 0, 0);
        const monthEnd = new Date(y, m, daysInMonth, 23, 59, 59, 999);

        const monthFrom = monthStart < fromDate ? fromDate : monthStart;
        const monthTo = monthEnd > toDate ? toDate : monthEnd;

        const startStr = fmt(monthFrom);
        const endStr = fmt(monthTo);

        let avg = 0;
        try {
          const res: any[] = await this.dataSource.query(
            `SELECT AVG(amount) AS avg FROM a7_outorders WHERE subType IS NOT NULL AND created_at >= ? AND created_at <= ?`,
            [startStr, endStr],
          );
          avg = Number(res[0]?.avg || 0);
        } catch (e) {
          months.push({ year: y, month: m + 1, value: 0 });
          m++;
          if (m > 11) {
            m = 0;
            y++;
          }
          continue;
        }

        months.push({ year: y, month: m + 1, value: avg });

        // advance month
        m++;
        if (m > 11) {
          m = 0;
          y++;
        }
      }

      return { statusCode: 200, data: { months } };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.owner/CStatsService.outordersAvgAmountByMonths',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async outordersProfitByMonths({
    from,
    to,
  }: {
    from: string;
    to: string;
  }): Promise<IResponse<any>> {
    try {
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

      const startYear = fromDate.getFullYear();
      const startMonth = fromDate.getMonth();
      const endYear = toDate.getFullYear();
      const endMonth = toDate.getMonth();

      const months: { year: number; month: number; value: number }[] = [];

      let y = startYear;
      let m = startMonth;
      while (y < endYear || (y === endYear && m <= endMonth)) {
        const daysInMonth = this.appService.daysInMonth(m, y);
        const monthStart = new Date(y, m, 1, 0, 0, 0, 0);
        const monthEnd = new Date(y, m, daysInMonth, 23, 59, 59, 999);

        const monthFrom = monthStart < fromDate ? fromDate : monthStart;
        const monthTo = monthEnd > toDate ? toDate : monthEnd;

        const startStr = fmt(monthFrom);
        const endStr = fmt(monthTo);

        try {
          const revRes: any[] = await this.dataSource.query(
            `SELECT SUM(amount) AS total FROM a7_outorders WHERE subType IS NOT NULL AND created_at >= ? AND created_at <= ?`,
            [startStr, endStr],
          );
          const refRes: any[] = await this.dataSource.query(
            `SELECT SUM(amount) AS total FROM a7_reforders WHERE created_at >= ? AND created_at <= ?`,
            [startStr, endStr],
          );

          const revenue = Number(revRes[0]?.total || 0);
          const refPayouts = Number(refRes[0]?.total || 0);
          const profit = Number((revenue - refPayouts).toFixed(2));

          months.push({ year: y, month: m + 1, value: profit });
        } catch (e) {
          // on error push zero and continue
          months.push({ year: y, month: m + 1, value: 0 });
          m++;
          if (m > 11) {
            m = 0;
            y++;
          }
          continue;
        }

        // advance month
        m++;
        if (m > 11) {
          m = 0;
          y++;
        }
      }

      return { statusCode: 200, data: { months } };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.owner/CStatsService.outordersProfitByMonths',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async shopordersBuyersByMonths({
    from,
    to,
  }: {
    from: string;
    to: string;
  }): Promise<IResponse<any>> {
    try {
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

      const startYear = fromDate.getFullYear();
      const startMonth = fromDate.getMonth();
      const endYear = toDate.getFullYear();
      const endMonth = toDate.getMonth();

      const months: { year: number; month: number; value: number }[] = [];

      let y = startYear;
      let m = startMonth;
      while (y < endYear || (y === endYear && m <= endMonth)) {
        const daysInMonth = this.appService.daysInMonth(m, y);
        const monthStart = new Date(y, m, 1, 0, 0, 0, 0);
        const monthEnd = new Date(y, m, daysInMonth, 23, 59, 59, 999);

        const monthFrom = monthStart < fromDate ? fromDate : monthStart;
        const monthTo = monthEnd > toDate ? toDate : monthEnd;

        const startStr = fmt(monthFrom);
        const endStr = fmt(monthTo);

        try {
          const res: any[] = await this.dataSource.query(
            `SELECT COUNT(DISTINCT email) AS cnt FROM a7_shoporders WHERE created_at >= ? AND created_at <= ? AND (status = 'paid' OR status = 'completed')`,
            [startStr, endStr],
          );

          const cnt = Number(res[0]?.cnt || 0);
          months.push({ year: y, month: m + 1, value: cnt });
        } catch (e) {
          months.push({ year: y, month: m + 1, value: 0 });
          m++;
          if (m > 11) {
            m = 0;
            y++;
          }
          continue;
        }

        // advance month
        m++;
        if (m > 11) {
          m = 0;
          y++;
        }
      }

      return { statusCode: 200, data: { months } };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.owner/CStatsService.shopordersBuyersByMonths',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async shopordersAvgOrderPriceByMonths({
    from,
    to,
  }: {
    from: string;
    to: string;
  }): Promise<IResponse<any>> {
    try {
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

      const startYear = fromDate.getFullYear();
      const startMonth = fromDate.getMonth();
      const endYear = toDate.getFullYear();
      const endMonth = toDate.getMonth();

      const months: { year: number; month: number; value: number }[] = [];

      let y = startYear;
      let m = startMonth;
      while (y < endYear || (y === endYear && m <= endMonth)) {
        const daysInMonth = this.appService.daysInMonth(m, y);
        const monthStart = new Date(y, m, 1, 0, 0, 0, 0);
        const monthEnd = new Date(y, m, daysInMonth, 23, 59, 59, 999);

        const monthFrom = monthStart < fromDate ? fromDate : monthStart;
        const monthTo = monthEnd > toDate ? toDate : monthEnd;

        const startStr = fmt(monthFrom);
        const endStr = fmt(monthTo);

        try {
          const res: any[] = await this.dataSource.query(
            `
            SELECT AVG(order_total) AS avg FROM (
              SELECT o.id, SUM(oi.qty * si.price) AS order_total
              FROM a7_shoporders o
              JOIN a7_shoporder_items oi ON oi.shoporder_id = o.id
              JOIN a7_shopitems si ON si.id = oi.shopitem_id
              WHERE o.created_at >= ? AND o.created_at <= ? AND (o.status = 'paid' OR o.status = 'completed')
              GROUP BY o.id
            ) t
          `,
            [startStr, endStr],
          );

          const avg = Number(res[0]?.avg || 0);
          months.push({ year: y, month: m + 1, value: avg });
        } catch (e) {
          months.push({ year: y, month: m + 1, value: 0 });
          m++;
          if (m > 11) {
            m = 0;
            y++;
          }
          continue;
        }

        // advance month
        m++;
        if (m > 11) {
          m = 0;
          y++;
        }
      }

      return { statusCode: 200, data: { months } };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.owner/CStatsService.shopordersAvgOrderPriceByMonths',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async shopordersRevenueByMonths({
    from,
    to,
  }: {
    from: string;
    to: string;
  }): Promise<IResponse<any>> {
    try {
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

      const startYear = fromDate.getFullYear();
      const startMonth = fromDate.getMonth();
      const endYear = toDate.getFullYear();
      const endMonth = toDate.getMonth();

      const months: { year: number; month: number; value: number }[] = [];

      let y = startYear;
      let m = startMonth;
      while (y < endYear || (y === endYear && m <= endMonth)) {
        const daysInMonth = this.appService.daysInMonth(m, y);
        const monthStart = new Date(y, m, 1, 0, 0, 0, 0);
        const monthEnd = new Date(y, m, daysInMonth, 23, 59, 59, 999);

        const monthFrom = monthStart < fromDate ? fromDate : monthStart;
        const monthTo = monthEnd > toDate ? toDate : monthEnd;

        const startStr = fmt(monthFrom);
        const endStr = fmt(monthTo);

        try {
          const res: any[] = await this.dataSource.query(
            `
            SELECT SUM(order_total) AS total FROM (
              SELECT o.id, SUM(oi.qty * si.price) AS order_total
              FROM a7_shoporders o
              JOIN a7_shoporder_items oi ON oi.shoporder_id = o.id
              JOIN a7_shopitems si ON si.id = oi.shopitem_id
              WHERE o.created_at >= ? AND o.created_at <= ? AND (o.status = 'paid' OR o.status = 'completed')
              GROUP BY o.id
            ) t
          `,
            [startStr, endStr],
          );

          const total = Number(res[0]?.total || 0);
          months.push({
            year: y,
            month: m + 1,
            value: Number(total.toFixed(2)),
          });
        } catch (e) {
          months.push({ year: y, month: m + 1, value: 0 });
          m++;
          if (m > 11) {
            m = 0;
            y++;
          }
          continue;
        }

        // advance month
        m++;
        if (m > 11) {
          m = 0;
          y++;
        }
      }

      return { statusCode: 200, data: { months } };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.owner/CStatsService.shopordersRevenueByMonths',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async shopordersProfitByMonths({
    from,
    to,
  }: {
    from: string;
    to: string;
  }): Promise<IResponse<any>> {
    try {
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

      const startYear = fromDate.getFullYear();
      const startMonth = fromDate.getMonth();
      const endYear = toDate.getFullYear();
      const endMonth = toDate.getMonth();

      const months: { year: number; month: number; value: number }[] = [];

      let y = startYear;
      let m = startMonth;
      while (y < endYear || (y === endYear && m <= endMonth)) {
        const daysInMonth = this.appService.daysInMonth(m, y);
        const monthStart = new Date(y, m, 1, 0, 0, 0, 0);
        const monthEnd = new Date(y, m, daysInMonth, 23, 59, 59, 999);

        const monthFrom = monthStart < fromDate ? fromDate : monthStart;
        const monthTo = monthEnd > toDate ? toDate : monthEnd;

        const startStr = fmt(monthFrom);
        const endStr = fmt(monthTo);

        try {
          // revenue from shoporders
          const revRes: any[] = await this.dataSource.query(
            `
            SELECT SUM(order_total) AS total FROM (
              SELECT o.id, SUM(oi.qty * si.price) AS order_total
              FROM a7_shoporders o
              JOIN a7_shoporder_items oi ON oi.shoporder_id = o.id
              JOIN a7_shopitems si ON si.id = oi.shopitem_id
              WHERE o.created_at >= ? AND o.created_at <= ? AND (o.status = 'paid' OR o.status = 'completed')
              GROUP BY o.id
            ) t
          `,
            [startStr, endStr],
          );

          // referrer payouts related to those shoporders
          const refRes: any[] = await this.dataSource.query(
            `
              SELECT SUM(r.amount) AS total
              FROM a7_reforders r
              JOIN a7_shoporders o ON o.email = r.referee_email
              WHERE r.created_at >= ? AND r.created_at <= ? AND o.created_at >= ? AND o.created_at <= ? AND (o.status = 'paid' OR o.status = 'completed')
            `,
            [startStr, endStr, startStr, endStr],
          );

          const revenue = Number(revRes[0]?.total || 0);
          const refPayouts = Number(refRes[0]?.total || 0);
          const profit = Number((revenue - refPayouts).toFixed(2));

          months.push({ year: y, month: m + 1, value: profit });
        } catch (e) {
          months.push({ year: y, month: m + 1, value: 0 });
          m++;
          if (m > 11) {
            m = 0;
            y++;
          }
          continue;
        }

        // advance month
        m++;
        if (m > 11) {
          m = 0;
          y++;
        }
      }

      return { statusCode: 200, data: { months } };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.owner/CStatsService.shopordersProfitByMonths',
        err,
      );
      return { statusCode: 500, error };
    }
  }
}
