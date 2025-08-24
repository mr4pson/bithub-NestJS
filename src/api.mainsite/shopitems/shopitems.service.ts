import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CShopitem } from 'src/model/entities/shopitem';
import { CLang } from 'src/model/entities/lang';
import { DataSource } from 'typeorm';
import { IShopitem } from './dto/shopitem.interface';
import { CAppService } from 'src/common/services/app.service';

@Injectable()
export class CShopitemsService {
  constructor(
    protected dataSource: DataSource,
    protected errorsService: CErrorsService,
    protected appService: CAppService,
  ) {}

  public async chunk(dto: IGetList): Promise<IResponse<IShopitem[]>> {
    try {
      const filter = this.buildFilter(dto.filter);
      const sortBy = `shopitems.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа,
      // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
      // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
      const preshopitems = await this.dataSource
        .getRepository(CShopitem)
        .createQueryBuilder('shopitems')
        .leftJoin('shopitems.translations', 'translations')
        .where(filter)
        .orderBy({ [sortBy]: sortDir })
        .take(dto.q)
        .skip(dto.from)
        .getMany();
      const ids = preshopitems.map((x) => x.id);
      const shopitems = await this.dataSource
        .getRepository(CShopitem)
        .createQueryBuilder('shopitems')
        .leftJoinAndSelect('shopitems.translations', 'translations')
        .whereInIds(ids)
        .orderBy({ [sortBy]: sortDir })
        .getMany();
      const elementsQuantity = await this.dataSource
        .getRepository(CShopitem)
        .createQueryBuilder('shopitems')
        .leftJoin('shopitems.translations', 'translations') // join to apply filter
        .where(filter)
        .getCount();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      const langs = await this.dataSource
        .getRepository(CLang)
        .find({ where: { active: true } });
      const data = shopitems.map((g) => this.buildShopitemMin(g, langs));
      //console.log(util.inspect(data[0], {showHidden: false, depth: null, colors: true}))
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CShopitemsService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(id: number): Promise<IResponse<IShopitem>> {
    try {
      const shopitem = await this.dataSource
        .getRepository(CShopitem)
        .findOne({ where: { id, active: true }, relations: ['translations'] });
      if (!shopitem) return { statusCode: 404, error: 'shopitem not found' };
      const langs = await this.dataSource
        .getRepository(CLang)
        .find({ where: { active: true } });
      const data = this.buildShopitemFull(shopitem, langs);
      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CShopitemsService.one',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  ///////////////////
  // utils
  ///////////////////

  private buildFilter(dtoFilter: any): string {
    let filter = 'shopitems.active = 1';

    if (dtoFilter.search) {
      filter += ` AND LOWER(translations.name) LIKE LOWER('%${dtoFilter.search}%')`;
    }

    if (dtoFilter.shopcat_id !== undefined) {
      if (dtoFilter.shopcat_id === null) {
        filter += ` AND shopitems.shopcat_id IS NULL`;
      } else {
        filter += ` AND shopitems.shopcat_id = '${dtoFilter.shopcat_id}'`;
      }
    }

    return filter;
  }

  private buildShopitemMin(shopitem: CShopitem, langs: CLang[]): IShopitem {
    const data: IShopitem = {
      id: shopitem.id,
      date: this.appService.mysqlDateToHumanDate(shopitem.date),
      img: shopitem.img,
      price: shopitem.price,
      min_items_num: shopitem.min_items_num,
      name: {},
      contentshort: {},
    };

    for (const l of langs) {
      const t = shopitem.translations.find((t) => t.lang_id === l.id);
      data.name[l.slug] = t.name;
      data.contentshort[l.slug] = t.contentshort;
    }

    return data;
  }

  private buildShopitemFull(shopitem: CShopitem, langs: CLang[]): IShopitem {
    const data: IShopitem = {
      id: shopitem.id,
      date: this.appService.mysqlDateToHumanDate(shopitem.date),
      img: shopitem.img,
      price: shopitem.price,
      min_items_num: shopitem.min_items_num,
      name: {},
      content: {},
    };

    for (const l of langs) {
      const t = shopitem.translations.find((t) => t.lang_id === l.id);
      data.name[l.slug] = t.name;
      data.content[l.slug] = t.content;
    }

    return data;
  }
}
