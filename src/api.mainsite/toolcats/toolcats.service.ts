import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { IResponse } from 'src/model/dto/response.interface';
import { CLang } from 'src/model/entities/lang';
import { CToolcat } from 'src/model/entities/toolcat';
import { DataSource } from 'typeorm';
import { IToolcat } from './dto/toolcat.interface';

@Injectable()
export class CToolcatsService {
  constructor(
    protected dataSource: DataSource,
    protected errorsService: CErrorsService,
  ) {}

  public async all(): Promise<IResponse<IToolcat[]>> {
    try {
      const toolcats = await this.dataSource
        .getRepository(CToolcat)
        .find({ order: { pos: 1 }, relations: ['translations'] });
      const langs = await this.dataSource
        .getRepository(CLang)
        .find({ where: { active: true } });
      const data = toolcats.map((c) => this.buildToolcat(c, langs));
      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CToolcatsService.all',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  /////////////////
  // utils
  /////////////////

  public buildToolcat(toolcat: CToolcat, langs: CLang[]): IToolcat {
    const data: IToolcat = {
      id: toolcat.id,
      name: {},
    };

    for (const l of langs) {
      const t = toolcat.translations.find((t) => t.lang_id === l.id);
      data.name[l.slug] = t.name;
    }

    return data;
  }
}
