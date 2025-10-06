import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { CGuide } from '../model/entities/guide';
import { CArticle } from '../model/entities/article';
import { CShopitem } from '../model/entities/shopitem';
import * as fs from 'fs';
import * as path from 'path';
import { cfg } from 'src/app.config';

@Injectable()
export class CSitemapAutoService {
  private readonly sitemapPath = path.resolve(
    __dirname,
    cfg.mainsiteUrl === 'http://localhost:4200'
      ? '../../../front.landing/sitemap.xml'
      : '../../../bithub-NestJS/sitemap.xml',
  );

  constructor(private dataSource: DataSource) {}

  @Cron('0 0 * * * *') // раз в час
  async generateSitemap(): Promise<void> {
    const staticUrls = [
      'https://app.drop.guide',
      'https://app.drop.guide/ru/education',
      'https://app.drop.guide/ru/shop',
      'https://app.drop.guide/ru/drops',
      'https://app.drop.guide/ru/shop/cart',
      'https://app.drop.guide/ru/stats',
      'https://app.drop.guide/ru/tasker',
      'https://app.drop.guide/ru/dailers',
      'https://drop.guide',
    ];

    // Динамические страницы
    const guides = await this.dataSource
      .getRepository(CGuide)
      .find({ select: ['slug'], where: { active: true } });
    const articles = await this.dataSource
      .getRepository(CArticle)
      .find({ select: ['slug'], where: { active: true } });
    const shopitems = await this.dataSource
      .getRepository(CShopitem)
      .find({ select: ['id'], where: { active: true } });

    const urls: string[] = [
      ...staticUrls,
      ...guides
        .filter((g) => g.slug)
        .map((g) => `https://app.drop.guide/ru/guide/${g.slug}`),
      ...articles
        .filter((a) => a.slug)
        .map((a) => `https://app.drop.guide/ru/education/${a.slug}`),
      ...shopitems.map((s) => `https://app.drop.guide/ru/shop/${s.id}`),
      ...articles
        .filter((a) => a.slug)
        .map((a) => `https://drop.guide/ru/articles/${a.slug}`),
    ];

    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls
        .map(
          (url) =>
            `  <url>\n    <loc>${url}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
        )
        .join('\n') +
      '\n</urlset>';

    fs.writeFileSync(this.sitemapPath, xml, 'utf8');

    console.log('generateSitemap: ' + this.sitemapPath);
  }
}
