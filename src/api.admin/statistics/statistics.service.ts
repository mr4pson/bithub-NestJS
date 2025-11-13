import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CUser } from 'src/model/entities/user';

@Injectable()
export class StatisticsService {
  constructor(private dataSource: DataSource) {}

  // returns array of last 12 months objects or months for a given year
  public async traffic(year?: number): Promise<any> {
    const now = new Date();

    // if year provided, return months for that year (1..12 or up to current month)
    if (year !== undefined && year !== null) {
      const y = year;
      const currentYear = now.getFullYear();
      if (y > currentYear) return { year: y, months: [], total: 0 };
      const maxMonth = y === currentYear ? now.getMonth() + 1 : 12;

      const rows: { month: number; cnt: number }[] =
        await this.dataSource.query(
          `SELECT MONTH(created_at) AS month, COUNT(*) AS cnt FROM a7_traffic WHERE YEAR(created_at) = ? GROUP BY month`,
          [y],
        );

      const months: { month: string; count: number }[] = [];
      let total = 0;
      for (let m = 1; m <= maxMonth; m++) {
        const found = rows.find((r) => Number(r.month) === m);
        const cnt = found ? Number(found.cnt) : 0;
        const monthKey = `${y}-${m.toString().padStart(2, '0')}`;
        months.push({ month: monthKey, count: cnt });
        total += cnt;
      }

      return { year: y, months, total };
    }

    // default: last 12 months
    const map = new Map<string, any>();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      map.set(key, { month: key, count: 0 });
    }

    let rows: any[] = [];
    try {
      rows = await this.dataSource.query(`
        SELECT YEAR(created_at) AS y, MONTH(created_at) AS m, COUNT(*) AS cnt
        FROM a7_traffic
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
        GROUP BY y, m
        ORDER BY y DESC, m DESC
      `);
    } catch (err) {
      return {
        months: Array.from(map.values()).sort((a, b) =>
          a.month < b.month ? 1 : -1,
        ),
        warning: err?.message || String(err),
      };
    }

    for (const r of rows) {
      const key = `${r.y}-${String(r.m).padStart(2, '0')}`;
      if (map.has(key)) {
        const cur = map.get(key);
        cur.count = Number(r.cnt || 0);
      }
    }

    return {
      months: Array.from(map.values()).sort((a, b) =>
        a.month < b.month ? 1 : -1,
      ),
    };
  }

  public async usersCount(year?: number): Promise<any> {
    try {
      const now = new Date();
      const y = year || now.getFullYear();
      const currentYear = now.getFullYear();

      // for current year only include months up to the current month
      if (y > currentYear) {
        return { year: y, months: [], total: 0 };
      }

      const maxMonth = y === currentYear ? now.getMonth() + 1 : 12;

      const rows: { month: number; cnt: number }[] =
        await this.dataSource.query(
          `SELECT MONTH(created_at) AS month, COUNT(*) AS cnt FROM a7_users WHERE YEAR(created_at) = ? GROUP BY month`,
          [y],
        );

      const months: { month: string; count: number }[] = [];
      let total = 0;
      for (let m = 1; m <= maxMonth; m++) {
        const found = rows.find((r) => Number(r.month) === m);
        const cnt = found ? Number(found.cnt) : 0;
        const monthKey = `${y}-${m.toString().padStart(2, '0')}`;
        months.push({ month: monthKey, count: cnt });
        total += cnt;
      }

      return { year: y, months, total };
    } catch (err) {
      const y = year || new Date().getFullYear();
      const now = new Date();
      const maxMonth = y === now.getFullYear() ? now.getMonth() + 1 : 12;
      const months = Array.from({ length: maxMonth }).map((_, i) => ({
        month: `${y}-${(i + 1).toString().padStart(2, '0')}`,
        count: 0,
      }));
      return { year: y, months, total: 0, error: err?.message || String(err) };
    }
  }

  public async orders(year?: number): Promise<any> {
    try {
      const now = new Date();
      const y = year || now.getFullYear();
      const currentYear = now.getFullYear();

      if (y > currentYear)
        return {
          year: y,
          months: [],
          totals: { shoporders: 0, inorders: 0, outorders: 0 },
        };

      const maxMonth = y === currentYear ? now.getMonth() + 1 : 12;

      // get counts grouped by month for each table
      const shopRows: { month: number; cnt: number }[] =
        await this.dataSource.query(
          `SELECT MONTH(created_at) AS month, COUNT(*) AS cnt FROM a7_shoporders WHERE YEAR(created_at) = ? GROUP BY month`,
          [y],
        );

      const inRows: { month: number; cnt: number }[] =
        await this.dataSource.query(
          `SELECT MONTH(created_at) AS month, COUNT(*) AS cnt FROM a7_inorders WHERE YEAR(created_at) = ? GROUP BY month`,
          [y],
        );

      const outRows: { month: number; cnt: number }[] =
        await this.dataSource.query(
          `SELECT MONTH(created_at) AS month, COUNT(*) AS cnt FROM a7_outorders WHERE YEAR(created_at) = ? GROUP BY month`,
          [y],
        );

      const months: {
        month: string;
        shoporders: number;
        inorders: number;
        outorders: number;
      }[] = [];
      const totals = { shoporders: 0, inorders: 0, outorders: 0 };

      for (let m = 1; m <= maxMonth; m++) {
        const shop = shopRows.find((r) => Number(r.month) === m);
        const ino = inRows.find((r) => Number(r.month) === m);
        const out = outRows.find((r) => Number(r.month) === m);
        const s = shop ? Number(shop.cnt) : 0;
        const i = ino ? Number(ino.cnt) : 0;
        const o = out ? Number(out.cnt) : 0;
        const monthKey = `${y}-${m.toString().padStart(2, '0')}`;
        months.push({
          month: monthKey,
          shoporders: s,
          inorders: i,
          outorders: o,
        });
        totals.shoporders += s;
        totals.inorders += i;
        totals.outorders += o;
      }

      return { year: y, months, totals };
    } catch (err) {
      const y = year || new Date().getFullYear();
      const now = new Date();
      const maxMonth = y === now.getFullYear() ? now.getMonth() + 1 : 12;
      const months = Array.from({ length: maxMonth }).map((_, i) => ({
        month: `${y}-${(i + 1).toString().padStart(2, '0')}`,
        shoporders: 0,
        inorders: 0,
        outorders: 0,
      }));
      return {
        year: y,
        months,
        totals: { shoporders: 0, inorders: 0, outorders: 0 },
        error: err?.message || String(err),
      };
    }
  }
}
