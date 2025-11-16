import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CLang } from 'src/model/entities/lang';
import { DataSource } from 'typeorm';
import { CAppService } from 'src/common/services/app.service';
import { IReadingUpdate } from './dto/reading.update.interface';
import { CReading } from 'src/model/entities/reading';
import { ITool } from './dto/tool.interface';
import { CTool } from 'src/model/entities/tool';
import { CToolReading } from 'src/model/entities/tool-reading';

@Injectable()
export class CToolsService {
  constructor(
    private dataSource: DataSource,
    protected errorsService: CErrorsService,
    protected appService: CAppService,
  ) {}

  public async chunk(
    dto: IGetList,
    user_id: number,
  ): Promise<IResponse<ITool[]>> {
    try {
      const filter = this.buildFilter(dto.filter);
      const sortBy = `tools.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа,
      // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
      // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
      const pretools = await this.dataSource
        .getRepository(CTool)
        .createQueryBuilder('tools')
        .leftJoin('tools.translations', 'translations')
        .where(filter)
        .orderBy({ [sortBy]: sortDir })
        .take(dto.q)
        .skip(dto.from)
        .getMany();
      const ids = pretools.map((x) => x.id);
      let query = this.dataSource
        .getRepository(CTool)
        .createQueryBuilder('tools')
        .leftJoinAndSelect('tools.translations', 'translations')
        .whereInIds(ids)
        .orderBy({ [sortBy]: sortDir });

      if (user_id) {
        query = query.loadRelationCountAndMap(
          'tools.readings_count',
          'tools.readings',
          'readings',
          (qb) => qb.where(`readings.user_id='${user_id}'`),
        ); // отметки о прочтении
      }

      const tools = await query.getMany();
      const elementsQuantity = await this.dataSource
        .getRepository(CTool)
        .createQueryBuilder('tools')
        .leftJoin('tools.translations', 'translations') // join to apply filter
        .where(filter)
        .getCount();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      const langs = await this.dataSource
        .getRepository(CLang)
        .find({ where: { active: true } });
      const data = tools.map((g) => this.buildToolMin(g, langs));
      //console.log(util.inspect(data[0], {showHidden: false, depth: null, colors: true}))
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CToolsService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(slug: string, user_id: number): Promise<IResponse<ITool>> {
    try {
      const tool = await this.dataSource
        .getRepository(CTool)
        .createQueryBuilder('tool')
        .leftJoinAndSelect('tool.translations', 'translations')
        .loadRelationCountAndMap(
          'tool.readings_count',
          'tool.readings',
          'readings',
          (qb) => qb.where(`readings.user_id='${user_id}'`),
        ) // отметки о прочтении
        .where(`tool.slug='${slug}' AND tool.active='1'`)
        .getOne();

      if (!tool) {
        return { statusCode: 404, error: 'tool not found' };
      }

      const langs = await this.dataSource
        .getRepository(CLang)
        .find({ where: { active: true } });
      const data = this.buildToolFull(tool, langs);
      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CToolsService.one',
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
        const reading = this.dataSource
          .getRepository(CToolReading)
          .create({ user_id, tool_id: dto.tool_id, created_at: new Date() });
        await this.dataSource.getRepository(CReading).save(reading);
      } else {
        await this.dataSource
          .getRepository(CToolReading)
          .delete({ user_id, tool_id: dto.tool_id });
      }

      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CToolsService.updateReading',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  ///////////////////
  // utils
  ///////////////////

  private buildFilter(dtoFilter: any): string {
    let filter = 'tools.active = 1';

    if (dtoFilter.search) {
      filter += ` AND (LOWER(translations.name) LIKE LOWER('%${dtoFilter.search}%') OR LOWER(translations.h1) LIKE LOWER('%${dtoFilter.search}%') OR LOWER(translations.keywords) LIKE LOWER('%${dtoFilter.search}%'))`;
    }

    if (dtoFilter.toolcat_id !== undefined) {
      if (dtoFilter.toolcat_id === null) {
        filter += ` AND tools.toolcat_id IS NULL`;
      } else {
        filter += ` AND tools.toolcat_id = '${dtoFilter.toolcat_id}'`;
      }
    }

    if (dtoFilter.is_for_landing !== undefined) {
      filter += ` AND tools.is_for_landing = ${dtoFilter.is_for_landing}`;
    }

    return filter;
  }

  private buildToolMin(tool: CTool, langs: CLang[]): ITool {
    const data: ITool = {
      id: tool.id,
      slug: tool.slug,
      date: this.appService.mysqlDateToHumanDate(tool.date),
      img: tool.img,
      yt_content: tool.yt_content,
      readtime: tool.readtime,
      is_for_landing: tool.is_for_landing,
      name: {},
      contentshort: {},
      canonical: {},
      was_read: tool['readings_count'] === 1,
    };

    for (const l of langs) {
      const t = tool.translations.find((t) => t.lang_id === l.id);
      data.name[l.slug] = t.name;
      data.contentshort[l.slug] = t.contentshort;
      data.canonical[l.slug] = t.canonical;
    }

    return data;
  }

  private buildToolFull(tool: CTool, langs: CLang[]): ITool {
    const data: ITool = {
      id: tool.id,
      slug: tool.slug,
      date: this.appService.mysqlDateToHumanDate(tool.date),
      img: tool.img,
      yt_content: tool.yt_content,
      readtime: tool.readtime,
      is_for_landing: tool.is_for_landing,
      name: {},
      content: {},
      title: {},
      description: {},
      canonical: {},
      h1: {},
      was_read: tool['readings_count'] === 1,
    };

    for (const l of langs) {
      const t = tool.translations.find((t) => t.lang_id === l.id);
      data.name[l.slug] = t.name;
      data.content[l.slug] = t.content;
      data.title[l.slug] = t.title;
      data.description[l.slug] = t.description;
      data.h1[l.slug] = t.h1;
      data.canonical[l.slug] = t.canonical;
    }

    return data;
  }
}
