import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CArticle } from 'src/model/entities/article';
import { CLang } from 'src/model/entities/lang';
import { DataSource } from 'typeorm';
import { IArticle } from './dto/article.interface';
import { CAppService } from 'src/common/services/app.service';
import { IReadingUpdate } from './dto/reading.update.interface';
import { CReading } from 'src/model/entities/reading';

@Injectable()
export class CArticlesService {
  constructor(
    private dataSource: DataSource,
    protected errorsService: CErrorsService,
    protected appService: CAppService,
  ) {}

  public async chunk(
    dto: IGetList,
    user_id: number,
  ): Promise<IResponse<IArticle[]>> {
    try {
      const filter = this.buildFilter(dto.filter);
      const sortBy = `articles.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа,
      // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
      // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
      const prearticles = await this.dataSource
        .getRepository(CArticle)
        .createQueryBuilder('articles')
        .leftJoin('articles.translations', 'translations')
        .where(filter)
        .orderBy({ [sortBy]: sortDir })
        .take(dto.q)
        .skip(dto.from)
        .getMany();
      const ids = prearticles.map((x) => x.id);
      let query = this.dataSource
        .getRepository(CArticle)
        .createQueryBuilder('articles')
        .leftJoinAndSelect('articles.translations', 'translations')
        .whereInIds(ids)
        .orderBy({ [sortBy]: sortDir });

      if (user_id) {
        query = query.loadRelationCountAndMap(
          'articles.readings_count',
          'articles.readings',
          'readings',
          (qb) => qb.where(`readings.user_id='${user_id}'`),
        ); // отметки о прочтении
      }

      const articles = await query.getMany();
      const elementsQuantity = await this.dataSource
        .getRepository(CArticle)
        .createQueryBuilder('articles')
        .leftJoin('articles.translations', 'translations') // join to apply filter
        .where(filter)
        .getCount();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      const langs = await this.dataSource
        .getRepository(CLang)
        .find({ where: { active: true } });
      const data = articles.map((g) => this.buildArticleFull(g, langs));
      //console.log(util.inspect(data[0], {showHidden: false, depth: null, colors: true}))
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CArticlesService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(
    slug: string,
    user_id: number,
  ): Promise<IResponse<IArticle>> {
    try {
      const article = await this.dataSource
        .getRepository(CArticle)
        .createQueryBuilder('article')
        .leftJoinAndSelect('article.translations', 'translations')
        .loadRelationCountAndMap(
          'article.readings_count',
          'article.readings',
          'readings',
          (qb) => qb.where(`readings.user_id='${user_id}'`),
        ) // отметки о прочтении
        .where(`article.slug='${slug}' AND article.active='1'`)
        .getOne();

      if (!article) {
        return { statusCode: 404, error: 'article not found' };
      }

      const langs = await this.dataSource
        .getRepository(CLang)
        .find({ where: { active: true } });
      const data = this.buildArticleFull(article, langs);
      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CArticlesService.one',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async updateReading(
    dto: IReadingUpdate,
    user_id: number,
  ): Promise<IResponse<void>> {
    try {
      if (dto.was_read) {
        const reading = this.dataSource.getRepository(CReading).create({
          user_id,
          article_id: dto.article_id,
          created_at: new Date(),
        });
        await this.dataSource.getRepository(CReading).save(reading);
      } else {
        await this.dataSource
          .getRepository(CReading)
          .delete({ user_id, article_id: dto.article_id });
      }

      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CArticlesService.updateReading',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  ///////////////////
  // utils
  ///////////////////

  private buildFilter(dtoFilter: any): string {
    let filter = 'articles.active = 1';

    if (dtoFilter.search) {
      filter += ` AND (LOWER(translations.name) LIKE LOWER('%${dtoFilter.search}%') OR LOWER(translations.h1) LIKE LOWER('%${dtoFilter.search}%') OR LOWER(translations.keywords) LIKE LOWER('%${dtoFilter.search}%'))`;
    }

    if (dtoFilter.artcat_id !== undefined) {
      if (dtoFilter.artcat_id === null) {
        filter += ` AND articles.artcat_id IS NULL`;
      } else {
        filter += ` AND articles.artcat_id = '${dtoFilter.artcat_id}'`;
      }
    }

    if (dtoFilter.is_for_landing !== undefined) {
      filter += ` AND articles.is_for_landing = ${dtoFilter.is_for_landing}`;
    }

    return filter;
  }

  private buildArticleMin(article: CArticle, langs: CLang[]): IArticle {
    const data: IArticle = {
      id: article.id,
      slug: article.slug,
      date: this.appService.mysqlDateToHumanDate(article.date),
      img: article.img,
      readtime: article.readtime,
      is_for_landing: article.is_for_landing,
      name: {},
      contentshort: {},
      canonical: {},
      was_read: article['readings_count'] === 1,
    };

    for (const l of langs) {
      const t = article.translations.find((t) => t.lang_id === l.id);
      data.name[l.slug] = t.name;
      data.contentshort[l.slug] = t.contentshort;
      data.canonical[l.slug] = t.canonical;
    }

    return data;
  }

  private buildArticleFull(article: CArticle, langs: CLang[]): IArticle {
    const data: IArticle = {
      id: article.id,
      slug: article.slug,
      date: this.appService.mysqlDateToHumanDate(article.date),
      img: article.img,
      yt_content: article.yt_content,
      readtime: article.readtime,
      is_for_landing: article.is_for_landing,
      name: {},
      contentshort: {},
      content: {},
      title: {},
      description: {},
      h1: {},
      canonical: {},
      was_read: article['readings_count'] === 1,
    };

    for (const l of langs) {
      const t = article.translations.find((t) => t.lang_id === l.id);
      data.name[l.slug] = t.name;
      data.content[l.slug] = t.content;
      data.title[l.slug] = t.title;
      data.description[l.slug] = t.description;
      data.contentshort[l.slug] = t.contentshort;
      data.h1[l.slug] = t.h1;
      data.canonical[l.slug] = t.canonical;
    }

    return data;
  }
}
