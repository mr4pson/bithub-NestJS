import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CToolcat } from 'src/model/entities/toolcat';
import { DataSource } from 'typeorm';
import { IToolcatCreate } from './dto/toolcat.create.interface';
import { IToolcatUpdate } from './dto/toolcat.update.interface';

@Injectable()
export class CToolcatsService {
  constructor(
    private dataSource: DataSource,
    private errorsService: CErrorsService,
  ) {}

  public async chunk(dto: IGetList): Promise<IResponse<CToolcat[]>> {
    try {
      const data = await this.dataSource.getRepository(CToolcat).find({
        order: { [dto.sortBy]: dto.sortDir },
        take: dto.q,
        skip: dto.from,
        relations: ['translations'],
      });
      const elementsQuantity = await this.dataSource
        .getRepository(CToolcat)
        .count();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CToolcatsService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(id: number): Promise<IResponse<CToolcat>> {
    try {
      const data = await this.dataSource
        .getRepository(CToolcat)
        .findOne({ where: { id }, relations: ['translations'] });
      return data
        ? { statusCode: 200, data }
        : { statusCode: 404, error: 'toolcat not found' };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CToolcatsService.one',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async delete(id: number): Promise<IResponse<void>> {
    try {
      await this.dataSource.getRepository(CToolcat).delete(id);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CToolcatsService.delete',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
    try {
      await this.dataSource.getRepository(CToolcat).delete(ids);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CToolcatsService.deleteBulk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async create(fd: IJsonFormData): Promise<IResponse<CToolcat>> {
    try {
      const dto = JSON.parse(fd.data) as IToolcatCreate;
      const x = this.dataSource.getRepository(CToolcat).create(dto);
      await this.dataSource.getRepository(CToolcat).save(x);
      return { statusCode: 201, data: x };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CToolcatsService.create',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async update(fd: IJsonFormData): Promise<IResponse<CToolcat>> {
    try {
      const dto = JSON.parse(fd.data) as IToolcatUpdate;
      const x = this.dataSource.getRepository(CToolcat).create(dto);
      await this.dataSource.getRepository(CToolcat).save(x);
      return { statusCode: 200, data: x };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CToolcatsService.update',
        err,
      );
      return { statusCode: 500, error };
    }
  }
}
