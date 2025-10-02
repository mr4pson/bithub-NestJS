import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CWithdraworder } from 'src/model/entities/withdraworder';
import { DataSource } from 'typeorm';

@Injectable()
export class CWithdrawordersService {
  constructor(
    private dataSource: DataSource,
    private errorsService: CErrorsService,
  ) {}

  public async chunk(dto: IGetList): Promise<IResponse<CWithdraworder[]>> {
    try {
      const filter = this.buildFilter(dto.filter);
      const sortBy = `withdraworders.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      const data = await this.dataSource
        .getRepository(CWithdraworder)
        .createQueryBuilder('withdraworders')
        .where(filter)
        .orderBy({ [sortBy]: sortDir })
        .take(dto.q)
        .skip(dto.from)
        .getMany();
      const elementsQuantity = await this.dataSource
        .getRepository(CWithdraworder)
        .createQueryBuilder('withdraworders')
        .where(filter)
        .getCount();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CWithdrawordersService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(id: number): Promise<IResponse<CWithdraworder>> {
    try {
      const data = await this.dataSource
        .getRepository(CWithdraworder)
        .findOne({ where: { id } });
      return data
        ? { statusCode: 200, data }
        : { statusCode: 404, error: 'withdraworder not found' };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CWithdrawordersService.one',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async complete(id: number): Promise<IResponse<string>> {
    try {
      const withdraworder = await this.dataSource
        .getRepository(CWithdraworder)
        .findOne({ where: { id } });
      if (!withdraworder) {
        return { statusCode: 404, error: 'Not found' };
      }
      withdraworder.completed = true;
      await this.dataSource.getRepository(CWithdraworder).save(withdraworder);

      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CWithdrawordersService.complete',
        err,
      );
    }
  }

  public async delete(id: number): Promise<IResponse<void>> {
    try {
      await this.dataSource.getRepository(CWithdraworder).delete(id);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CWithdrawordersService.delete',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
    try {
      await this.dataSource.getRepository(CWithdraworder).delete(ids);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CWithdrawordersService.deleteBulk',
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
      filter += ` AND withdraworders.created_at >= '${dtoFilter.from}'`;
    }

    if (dtoFilter.to !== undefined) {
      filter += ` AND withdraworders.created_at <= '${dtoFilter.to}'`;
    }

    if (dtoFilter.user_email) {
      filter += ` AND LOWER(withdraworders.user_email) LIKE LOWER('%${dtoFilter.user_email}%')`;
    }

    return filter;
  }
}
