import { Injectable } from '@nestjs/common';
import { DataSource, In, Not, Repository } from 'typeorm';
import { CLang } from 'src/model/entities/lang';
import { IResponse } from 'src/model/dto/response.interface';
import { ILangCreate } from './dto/lang.create.interface';
import { ILangUpdate } from './dto/lang.update.interface';
import { IGetList } from 'src/model/dto/getlist.interface';
import { CUploadsService } from 'src/common/services/uploads.service';
import { CImagableService } from 'src/common/services/imagable.service';
import { CAppService } from 'src/common/services/app.service';
import { IKeyValue } from 'src/model/keyvalue.interface';
import { CErrorsService } from 'src/common/services/errors.service';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';

@Injectable()
export class CLangsService extends CImagableService {
  protected entity = 'CLang';
  protected folder = 'langs';
  protected resizeMap: IKeyValue<number> = { img: 100 };

  constructor(
    protected dataSource: DataSource,
    protected uploadsService: CUploadsService,
    protected appService: CAppService,
    protected errorsService: CErrorsService,
  ) {
    super(uploadsService, dataSource);
  }

  public async all(dto: IGetList): Promise<IResponse<CLang[]>> {
    try {
      const data = await this.dataSource
        .getRepository(CLang)
        .find({ order: { [dto.sortBy]: dto.sortDir } });
      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CLangsService.all',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async chunk(dto: IGetList): Promise<IResponse<CLang[]>> {
    try {
      const data = await this.dataSource.getRepository(CLang).find({
        order: { [dto.sortBy]: dto.sortDir },
        take: dto.q,
        skip: dto.from,
      });
      const elementsQuantity = await this.dataSource
        .getRepository(CLang)
        .count();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CLangsService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(id: number): Promise<IResponse<CLang>> {
    try {
      const data = await this.dataSource.getRepository(CLang).findOneBy({ id });
      return data
        ? { statusCode: 200, data }
        : { statusCode: 404, error: 'lang not found' };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CLangsService.one',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async delete(id: number): Promise<IResponse<void>> {
    try {
      const x = await this.dataSource.getRepository(CLang).findOneBy({ id });
      await this.deleteUnbindedImgOnDelete([x], false);
      await this.dataSource.getRepository(CLang).delete(id);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CLangsService.delete',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
    try {
      const xl = await this.dataSource
        .getRepository(CLang)
        .findBy({ id: In(ids) });
      await this.deleteUnbindedImgOnDelete(xl, false);
      await this.dataSource.getRepository(CLang).delete(ids);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CLangsService.deleteBulk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async create(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
  ): Promise<IResponse<CLang>> {
    try {
      const dto = JSON.parse(fd.data) as ILangCreate;
      const x = this.dataSource.getRepository(CLang).create(dto);
      await this.buildImg(x, uploads);
      await this.dataSource.getRepository(CLang).save(x);
      await this.rebuildSlugable(x);
      await this.rebuildMultilangEntities(x.id);
      return { statusCode: 201, data: x };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CLangsService.create',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async update(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
  ): Promise<IResponse<CLang>> {
    try {
      const dto = JSON.parse(fd.data) as ILangUpdate;
      const x = this.dataSource.getRepository(CLang).create(dto);
      const old = await this.dataSource
        .getRepository(CLang)
        .findOneBy({ id: x.id });
      await this.buildImg(x, uploads);
      await this.deleteUnbindedImgOnUpdate(x, old); // if img changed then delete old file
      await this.dataSource.getRepository(CLang).save(x);
      await this.rebuildSlugable(x);
      return { statusCode: 200, data: x };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CLangsService.update',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  /////////////////
  // utils
  /////////////////

  private async rebuildSlugable(x: CLang): Promise<void> {
    if (x.slugable) {
      await this.dataSource
        .getRepository(CLang)
        .update({ id: Not(x.id) }, { slugable: false });
    }
  }

  private async rebuildMultilangEntities(lang_id: number): Promise<void> {
    await this.rebuildMultilangEntitiesFor('CWord', 'word_id', lang_id);
    await this.rebuildMultilangEntitiesFor(
      'CMailtemplate',
      'mailtemplate_id',
      lang_id,
    );
    await this.rebuildMultilangEntitiesFor('CPage', 'page_id', lang_id);
    await this.rebuildMultilangEntitiesFor('CCat', 'cat_id', lang_id);
    await this.rebuildMultilangEntitiesFor('CGuide', 'guide_id', lang_id);
    await this.rebuildMultilangEntitiesFor('CTask', 'task_id', lang_id);
    await this.rebuildMultilangEntitiesFor('CTariff', 'tariff_id', lang_id);
    await this.rebuildMultilangEntitiesFor('CArtcat', 'artcat_id', lang_id);
    await this.rebuildMultilangEntitiesFor('CArticle', 'article_id', lang_id);
    await this.rebuildMultilangEntitiesFor('CAward', 'award_id', lang_id);
    await this.rebuildMultilangEntitiesFor('CBaxer', 'baxer_id', lang_id);
    await this.rebuildMultilangEntitiesFor('CShopcat', 'shopcat_id', lang_id);
    await this.rebuildMultilangEntitiesFor('CShopitem', 'shopitem_id', lang_id);
    await this.rebuildMultilangEntitiesFor('CDrop', 'drop_id', lang_id);
  }

  private async rebuildMultilangEntitiesFor(
    entity: string,
    foreignField: string,
    lang_id: number,
  ): Promise<void> {
    const entityRepository: Repository<any> =
      this.dataSource.getRepository(entity);
    const translationRepository: Repository<any> =
      this.dataSource.getRepository(`${entity}Translation`);
    const xl = await entityRepository.find();
    const tl = [];

    for (const x of xl) {
      tl.push(translationRepository.create({ [foreignField]: x.id, lang_id }));
    }

    await translationRepository.save(tl);
  }
}
