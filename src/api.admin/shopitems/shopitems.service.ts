import { Injectable } from '@nestjs/common';
import { CAppService } from 'src/common/services/app.service';
import { CErrorsService } from 'src/common/services/errors.service';
import { CImagableService } from 'src/common/services/imagable.service';
import { CUploadsService } from 'src/common/services/uploads.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CShopitem } from 'src/model/entities/shopitem';
import { IKeyValue } from 'src/model/keyvalue.interface';
import { DataSource, In } from 'typeorm';
import { IShopitemCreate } from './dto/shopitem.create.interface';
import { IShopitemUpdate } from './dto/shopitem.update.interface';

@Injectable()
export class CShopitemsService extends CImagableService {
  protected entity = 'CShopitem';
  protected folder = 'shopitems';
  protected resizeMap: IKeyValue<number> = { img: 300 };

  constructor(
    protected dataSource: DataSource,
    protected uploadsService: CUploadsService,
    protected appService: CAppService,
    protected errorsService: CErrorsService,
  ) {
    super(uploadsService, dataSource);
  }

  public async chunk(dto: IGetList): Promise<IResponse<CShopitem[]>> {
    try {
      const filter = this.buildFilter(dto.filter);
      const sortBy = `shopitems.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа,
      // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
      // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
      const predata = await this.dataSource
        .getRepository(CShopitem)
        .createQueryBuilder('shopitems')
        .leftJoin('shopitems.translations', 'translations')
        .where(filter)
        .orderBy({ [sortBy]: sortDir })
        .take(dto.q)
        .skip(dto.from)
        .getMany();
      const ids = predata.map((x) => x.id);
      const data = await this.dataSource
        .getRepository(CShopitem)
        .createQueryBuilder('shopitems')
        .leftJoinAndSelect('shopitems.translations', 'translations')
        .leftJoinAndSelect('shopitems.shopcat', 'shopcat')
        .leftJoinAndSelect('shopcat.translations', 'shopcat_translations')
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
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopitemsService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(id: number): Promise<IResponse<CShopitem>> {
    try {
      const data = await this.dataSource
        .getRepository(CShopitem)
        .findOne({ where: { id }, relations: ['translations'] });
      return data
        ? { statusCode: 200, data }
        : { statusCode: 404, error: 'shopitem not found' };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopitemsService.one',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async delete(id: number): Promise<IResponse<void>> {
    try {
      const x = await this.dataSource
        .getRepository(CShopitem)
        .findOneBy({ id });
      await this.deleteUnbindedImgOnDelete([x], false);
      await this.dataSource.getRepository(CShopitem).delete(id);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopitemsService.delete',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
    try {
      const xl = await this.dataSource
        .getRepository(CShopitem)
        .findBy({ id: In(ids) });
      await this.deleteUnbindedImgOnDelete(xl, false);
      await this.dataSource.getRepository(CShopitem).delete(ids);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopitemsService.deleteBulk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async archive(id: number): Promise<IResponse<void>> {
    try {
      await this.dataSource
        .getRepository(CShopitem)
        .update({ id }, { archived: true });
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopitemsService.archive',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async archiveBulk(ids: number[]): Promise<IResponse<void>> {
    try {
      await this.dataSource
        .getRepository(CShopitem)
        .update({ id: In(ids) }, { archived: true });
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopitemsService.archiveBulk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async create(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
  ): Promise<IResponse<CShopitem>> {
    try {
      const dto = JSON.parse(fd.data) as IShopitemCreate;
      const x = this.dataSource.getRepository(CShopitem).create(dto);
      await this.buildImg(x, uploads);
      await this.dataSource.getRepository(CShopitem).save(x);
      return { statusCode: 201, data: x };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopitemsService.create',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async update(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
  ): Promise<IResponse<CShopitem>> {
    try {
      const dto = JSON.parse(fd.data) as IShopitemUpdate;
      const x = this.dataSource.getRepository(CShopitem).create(dto);
      const old = await this.dataSource
        .getRepository(CShopitem)
        .findOneBy({ id: x.id });
      await this.buildImg(x, uploads);
      await this.deleteUnbindedImgOnUpdate(x, old); // if img changed then delete old file
      await this.dataSource.getRepository(CShopitem).save(x);
      return { statusCode: 200, data: x };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopitemsService.update',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  ///////////////
  // utils
  ///////////////

  private buildFilter(dtoFilter: any): string {
    let filter = "shopitems.archived = '0'";

    if (dtoFilter.name) {
      filter += ` AND LOWER(translations.name) LIKE LOWER('%${dtoFilter.name}%')`;
    }

    if (dtoFilter.search) {
      filter += ` AND (LOWER(translations.name) LIKE LOWER('%${dtoFilter.search}%') OR shopitems.id='${dtoFilter.search}')`;
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

  private async fakeInit(): Promise<void> {
    for (let i = 0; i < 100; i++) {
      const x = new CShopitem().fakeInit(i);
      await this.dataSource.getRepository(CShopitem).save(x);
    }
  }
}
