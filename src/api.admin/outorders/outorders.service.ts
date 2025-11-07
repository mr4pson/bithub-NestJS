import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IResponse } from 'src/model/dto/response.interface';
import { COutorder } from 'src/model/entities/outorder';
import { DataSource } from 'typeorm';

@Injectable()
export class COutordersService {
  constructor(
    private dataSource: DataSource,
    private errorsService: CErrorsService,
  ) {}

  public async chunk(dto: IGetList): Promise<IResponse<COutorder[]>> {
    try {
      const filter = this.buildFilter(dto.filter);
      const sortBy = `outorders.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      const data = await this.dataSource
        .getRepository(COutorder)
        .createQueryBuilder('outorders')
        .where(filter)
        .orderBy({ [sortBy]: sortDir })
        .take(dto.q)
        .skip(dto.from)
        .getMany();
      const elementsQuantity = await this.dataSource
        .getRepository(COutorder)
        .createQueryBuilder('outorders')
        .where(filter)
        .getCount();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/COutordersService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(id: number): Promise<IResponse<COutorder>> {
    try {
      const data = await this.dataSource
        .getRepository(COutorder)
        .findOne({ where: { id } });
      return data
        ? { statusCode: 200, data }
        : { statusCode: 404, error: 'outorder not found' };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/COutordersService.one',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async delete(id: number): Promise<IResponse<void>> {
    try {
      await this.dataSource.getRepository(COutorder).delete(id);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/COutordersService.delete',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
    try {
      await this.dataSource.getRepository(COutorder).delete(ids);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/COutordersService.deleteBulk',
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

    if (dtoFilter.from !== undefined) {
      filter += ` AND outorders.created_at >= '${dtoFilter.from}'`;
    }

    if (dtoFilter.to !== undefined) {
      filter += ` AND outorders.created_at <= '${dtoFilter.to}'`;
    }

    if (dtoFilter.user_email) {
      filter += ` AND LOWER(outorders.user_email) LIKE LOWER('%${dtoFilter.user_email}%')`;
    }

    return filter;
  }
}
