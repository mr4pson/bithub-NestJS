import { Injectable } from '@nestjs/common';
import { CAppService } from 'src/common/services/app.service';
import { CErrorsService } from 'src/common/services/errors.service';
import { CImagableService } from 'src/common/services/imagable.service';
import { CUploadsService } from 'src/common/services/uploads.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CArticle } from 'src/model/entities/article';
import { IKeyValue } from 'src/model/keyvalue.interface';
import { DataSource, In, IsNull, Not } from 'typeorm';
import { IArticleCreate } from './dto/article.create.interface';
import { CSlugService } from 'src/common/services/slug.service';
import { IArticleUpdate } from './dto/article.update.interface';
import { CTgBotService } from 'src/common/services/mailable/tg.bot.service';
import { CUser } from 'src/model/entities/user';

@Injectable()
export class CArticlesService extends CImagableService {
  protected entity = 'CArticle';
  protected folder = 'articles';
  protected resizeMap: IKeyValue<number> = { img: 300 };

  constructor(
    protected dataSource: DataSource,
    protected uploadsService: CUploadsService,
    protected appService: CAppService,
    protected errorsService: CErrorsService,
    protected slugService: CSlugService,
    protected tgBotService: CTgBotService,
  ) {
    super(uploadsService, dataSource);
  }

  public async chunk(dto: IGetList): Promise<IResponse<CArticle[]>> {
    try {
      const filter = this.buildFilter(dto.filter);
      const sortBy = `articles.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа,
      // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
      // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
      const predata = await this.dataSource
        .getRepository(CArticle)
        .createQueryBuilder('articles')
        .leftJoin('articles.translations', 'translations')
        .where(filter)
        .orderBy({ [sortBy]: sortDir })
        .take(dto.q)
        .skip(dto.from)
        .getMany();
      const ids = predata.map((x) => x.id);
      const data = await this.dataSource
        .getRepository(CArticle)
        .createQueryBuilder('articles')
        .leftJoinAndSelect('articles.translations', 'translations')
        .leftJoinAndSelect('articles.artcat', 'artcat')
        .leftJoinAndSelect('artcat.translations', 'artcat_translations')
        .whereInIds(ids)
        .orderBy({ [sortBy]: sortDir })
        .getMany();
      const elementsQuantity = await this.dataSource
        .getRepository(CArticle)
        .createQueryBuilder('articles')
        .leftJoin('articles.translations', 'translations') // join to apply filter
        .where(filter)
        .getCount();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CArticlesService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(id: number): Promise<IResponse<CArticle>> {
    try {
      const data = await this.dataSource
        .getRepository(CArticle)
        .findOne({ where: { id }, relations: ['translations'] });
      return data
        ? { statusCode: 200, data }
        : { statusCode: 404, error: 'article not found' };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CArticlesService.one',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async delete(id: number): Promise<IResponse<void>> {
    try {
      const x = await this.dataSource.getRepository(CArticle).findOneBy({ id });
      await this.deleteUnbindedImgOnDelete([x], false);
      await this.dataSource.getRepository(CArticle).delete(id);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CArticlesService.delete',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
    try {
      const xl = await this.dataSource
        .getRepository(CArticle)
        .findBy({ id: In(ids) });
      await this.deleteUnbindedImgOnDelete(xl, false);
      await this.dataSource.getRepository(CArticle).delete(ids);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CArticlesService.deleteBulk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async create(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
  ): Promise<IResponse<CArticle>> {
    try {
      const dto = JSON.parse(fd.data) as IArticleCreate;
      const x = this.dataSource.getRepository(CArticle).create(dto);

      await this.buildImg(x, uploads);
      x.slug = await this.slugService.checkSlug(
        this.dataSource.getRepository(CArticle),
        x,
      );
      x.yt_content = this.appService.adjustYtContent(x.yt_content);
      await this.dataSource.getRepository(CArticle).save(x);

      if (x.active) {
        this.tgNotifyNewarticle(x);
      }
      return { statusCode: 201, data: x };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CArticlesService.create',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async update(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
  ): Promise<IResponse<CArticle>> {
    try {
      const dto = JSON.parse(fd.data) as IArticleUpdate;
      const x = this.dataSource.getRepository(CArticle).create(dto);
      const old = await this.dataSource
        .getRepository(CArticle)
        .findOneBy({ id: x.id });
      await this.buildImg(x, uploads);
      await this.deleteUnbindedImgOnUpdate(x, old); // if img changed then delete old file
      x.slug = await this.slugService.checkSlug(
        this.dataSource.getRepository(CArticle),
        x,
      );
      x.yt_content = this.appService.adjustYtContent(x.yt_content);
      await this.dataSource.getRepository(CArticle).save(x);
      return { statusCode: 200, data: x };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CArticlesService.update',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  ///////////////
  // utils
  ///////////////

  private buildFilter(dtoFilter: any): string {
    let filter = 'TRUE';

    if (dtoFilter.name) {
      filter += ` AND LOWER(translations.name) LIKE LOWER('%${dtoFilter.name}%')`;
    }

    if (dtoFilter.artcat_id !== undefined) {
      if (dtoFilter.artcat_id === null) {
        filter += ` AND articles.artcat_id IS NULL`;
      } else {
        filter += ` AND articles.artcat_id = '${dtoFilter.artcat_id}'`;
      }
    }

    return filter;
  }

  private async fakeInit(): Promise<void> {
    for (let i = 0; i < 100; i++) {
      const x = new CArticle().fakeInit(i);
      await this.dataSource.getRepository(CArticle).save(x);
    }
  }

  private async tgNotifyNewarticle(article: CArticle): Promise<void> {
    try {
      // отправляем тем, у кого включен параметр tg_articles
      const users = await this.dataSource.getRepository(CUser).find({
        where: {
          active: true,
          tg_id: Not(IsNull()),
          tg_active: true,
          tg_articles: true,
        },
        relations: ['lang'],
      });

      for (const user of users) {
        await this.appService.pause(1000); // не больше 30 сообщений в секунду, возьмем с запасом - 1 в секунду
        await this.tgBotService.userNewarticle(user, article);
      }
    } catch (err) {
      await this.errorsService.log(
        'api.admin/CArticlesService.tgNotifyNewarticle',
        err,
      );
    }
  }
}
