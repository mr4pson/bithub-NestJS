import { Injectable } from '@nestjs/common';
import { CAppService } from 'src/common/services/app.service';
import { CErrorsService } from 'src/common/services/errors.service';
import { CImagableService } from 'src/common/services/imagable.service';
import { CUploadsService } from 'src/common/services/uploads.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { IResponse } from 'src/model/dto/response.interface';
import { IKeyValue } from 'src/model/keyvalue.interface';
import { DataSource, In, IsNull, Not } from 'typeorm';
import { CSlugService } from 'src/common/services/slug.service';
import { CTgBotService } from 'src/common/services/mailable/tg.bot.service';
import { CUser } from 'src/model/entities/user';
import { CTool } from 'src/model/entities/tool';
import { IToolCreate } from './dto/tool.create.interface';
import { IToolUpdate } from './dto/tool.update.interface';

@Injectable()
export class CToolsService extends CImagableService {
  protected entity = 'CTool';
  protected folder = 'tools';
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

  public async chunk(dto: IGetList): Promise<IResponse<CTool[]>> {
    try {
      const filter = this.buildFilter(dto.filter);
      const sortBy = `tools.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа,
      // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
      // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
      const predata = await this.dataSource
        .getRepository(CTool)
        .createQueryBuilder('tools')
        .leftJoin('tools.translations', 'translations')
        .where(filter)
        .orderBy({ [sortBy]: sortDir })
        .take(dto.q)
        .skip(dto.from)
        .getMany();
      const ids = predata.map((x) => x.id);
      const data = await this.dataSource
        .getRepository(CTool)
        .createQueryBuilder('tools')
        .leftJoinAndSelect('tools.translations', 'translations')
        .leftJoinAndSelect('tools.toolcat', 'toolcat')
        .leftJoinAndSelect('toolcat.translations', 'toolcat_translations')
        .whereInIds(ids)
        .orderBy({ [sortBy]: sortDir })
        .getMany();
      const elementsQuantity = await this.dataSource
        .getRepository(CTool)
        .createQueryBuilder('tools')
        .leftJoin('tools.translations', 'translations') // join to apply filter
        .where(filter)
        .getCount();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CToolsService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(id: number): Promise<IResponse<CTool>> {
    try {
      const data = await this.dataSource
        .getRepository(CTool)
        .findOne({ where: { id }, relations: ['translations'] });
      return data
        ? { statusCode: 200, data }
        : { statusCode: 404, error: 'tool not found' };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CToolsService.one',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async delete(id: number): Promise<IResponse<void>> {
    try {
      const x = await this.dataSource.getRepository(CTool).findOneBy({ id });
      await this.deleteUnbindedImgOnDelete([x], false);
      await this.dataSource.getRepository(CTool).delete(id);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CToolsService.delete',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
    try {
      const xl = await this.dataSource
        .getRepository(CTool)
        .findBy({ id: In(ids) });
      await this.deleteUnbindedImgOnDelete(xl, false);
      await this.dataSource.getRepository(CTool).delete(ids);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CToolsService.deleteBulk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async create(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
  ): Promise<IResponse<CTool>> {
    try {
      const dto = JSON.parse(fd.data) as IToolCreate;
      const x = this.dataSource.getRepository(CTool).create(dto);

      await this.buildImg(x, uploads);
      x.slug = await this.slugService.checkSlug(
        this.dataSource.getRepository(CTool),
        x,
      );
      x.yt_content = this.appService.adjustYtContent(x.yt_content);
      await this.dataSource.getRepository(CTool).save(x);

      if (x.active) {
        this.tgNotifyNewTool(x);
      }
      return { statusCode: 201, data: x };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CToolsService.create',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async update(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
  ): Promise<IResponse<CTool>> {
    try {
      const dto = JSON.parse(fd.data) as IToolUpdate;
      const x = this.dataSource.getRepository(CTool).create(dto);
      const old = await this.dataSource
        .getRepository(CTool)
        .findOneBy({ id: x.id });
      await this.buildImg(x, uploads);
      await this.deleteUnbindedImgOnUpdate(x, old); // if img changed then delete old file
      x.slug = await this.slugService.checkSlug(
        this.dataSource.getRepository(CTool),
        x,
      );
      x.yt_content = this.appService.adjustYtContent(x.yt_content);
      await this.dataSource.getRepository(CTool).save(x);
      return { statusCode: 200, data: x };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CToolsService.update',
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

    if (dtoFilter.toolcat_id !== undefined) {
      if (dtoFilter.toolcat_id === null) {
        filter += ` AND tools.toolcat_id IS NULL`;
      } else {
        filter += ` AND tools.toolcat_id = '${dtoFilter.toolcat_id}'`;
      }
    }

    return filter;
  }

  private async fakeInit(): Promise<void> {
    for (let i = 0; i < 100; i++) {
      const x = new CTool().fakeInit(i);
      await this.dataSource.getRepository(CTool).save(x);
    }
  }

  private async tgNotifyNewTool(tool: CTool): Promise<void> {
    try {
      // отправляем тем, у кого включен параметр tg_tools
      const users = await this.dataSource.getRepository(CUser).find({
        where: {
          active: true,
          tg_id: Not(IsNull()),
          tg_active: true,
          tg_tools: true,
        },
        relations: ['lang'],
      });

      for (const user of users) {
        await this.appService.pause(1000); // не больше 30 сообщений в секунду, возьмем с запасом - 1 в секунду
        await this.tgBotService.userNewTool(user, tool);
      }
    } catch (err) {
      await this.errorsService.log(
        'api.admin/CToolsService.tgNotifyNewTool',
        err,
      );
    }
  }
}
