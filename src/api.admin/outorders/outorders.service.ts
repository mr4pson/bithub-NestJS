import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IResponse } from 'src/model/dto/response.interface';
import { COutorder } from 'src/model/entities/outorder';
import { CUser } from 'src/model/entities/user';
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
      // allow sorting by related user's tg_username
      const sortBy =
        dto.sortBy === 'tg_username'
          ? 'user.tg_username'
          : `outorders.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      const data = await this.dataSource
        .getRepository(COutorder)
        .createQueryBuilder('outorders')
        // map related user by email so we can extract tg_username
        .leftJoinAndMapOne(
          'outorders.__user',
          CUser,
          'user',
          'outorders.user_email = user.email',
        )
        .where(filter)
        .orderBy({ [sortBy]: sortDir })
        .take(dto.q)
        .skip(dto.from)
        .getMany();

      // attach tg_username from mapped user and remove the temporary __user field
      const dataWithTg = (data as any[]).map((item) => {
        const tg = item.__user ? item.__user.tg_username : null;
        // avoid leaking the mapped user object in the response
        if (item.__user) delete item.__user;
        return { ...item, tg_username: tg };
      });

      const elementsQuantity = await this.dataSource
        .getRepository(COutorder)
        .createQueryBuilder('outorders')
        .leftJoin(CUser, 'user', 'outorders.user_email = user.email')
        .where(filter)
        .getCount();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      return {
        statusCode: 200,
        data: dataWithTg,
        elementsQuantity,
        pagesQuantity,
      };
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

    if (dtoFilter.tg_username) {
      // 'user' alias is created in the query via leftJoin/leftJoinAndMapOne
      filter += ` AND LOWER(user.tg_username) LIKE LOWER('%${dtoFilter.tg_username}%')`;
    }

    return filter;
  }
}
