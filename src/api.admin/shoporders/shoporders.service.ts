import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CShoporder } from 'src/model/entities/shoporder';
import { DataSource } from 'typeorm';
import { IShoporderUpdate } from './dto/shoporder.update.interface';

@Injectable()
export class CShopordersService {
  constructor(
    private dataSource: DataSource,
    private errorsService: CErrorsService,
  ) {}

  public async chunk(dto: IGetList): Promise<IResponse<CShoporder[]>> {
    try {
      const filter = this.buildFilter(dto.filter);
      const sortBy = `shoporders.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      const data = await this.dataSource
        .getRepository(CShoporder)
        .createQueryBuilder('shoporders')
        .leftJoinAndSelect('shoporders.items', 'items')
        .where(filter)
        .orderBy({ [sortBy]: sortDir })
        .take(dto.q)
        .skip(dto.from)
        .getMany();
      const elementsQuantity = await this.dataSource
        .getRepository(CShoporder)
        .createQueryBuilder('shoporders')
        .where(filter)
        .getCount();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopordersService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(id: number): Promise<IResponse<CShoporder>> {
    try {
      const data = await this.dataSource.getRepository(CShoporder).findOne({
        where: { id },
        relations: ['items', 'items.shopitem', 'items.shopitem.translations'],
      });
      if (!data) return { statusCode: 404, error: 'shoporder not found' };

      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopordersService.one',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async delete(id: number): Promise<IResponse<void>> {
    try {
      await this.dataSource.getRepository(CShoporder).delete(id);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopordersService.delete',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
    try {
      await this.dataSource.getRepository(CShoporder).delete(ids);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopordersService.deleteBulk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async update(fd: IJsonFormData): Promise<IResponse<CShoporder>> {
    try {
      const dto = JSON.parse(fd.data) as IShoporderUpdate;
      // Обновляем основной заказ
      const orderRepo = this.dataSource.getRepository(CShoporder);
      const itemRepo = this.dataSource.getRepository('CShoporderItem');
      const order = await orderRepo.findOne({
        where: { id: dto.id },
        relations: ['items'],
      });
      if (!order) return { statusCode: 404, error: 'shoporder not found' };
      order.email = dto.email;
      order.tg = dto.tg;
      order.comment = dto.comment;
      order.status = dto.status;
      // Удаляем старые позиции
      if (order.items && order.items.length) {
        for (const item of order.items) {
          await itemRepo.delete(item.id);
        }
      }
      // Добавляем новые позиции
      for (const item of dto.items) {
        await itemRepo.save({
          shoporder_id: order.id,
          shopitem_id: item.shopitem_id,
          qty: item.qty,
        });
      }
      await orderRepo.save(order);
      const updated = await orderRepo.findOne({
        where: { id: order.id },
        relations: ['items'],
      });
      return { statusCode: 200, data: updated };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CShopordersService.update',
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
      filter += ` AND shoporders.created_at >= '${dtoFilter.from}'`;
    }

    if (dtoFilter.to !== undefined) {
      filter += ` AND shoporders.created_at <= '${dtoFilter.to}'`;
    }

    if (dtoFilter.email) {
      filter += ` AND LOWER(shoporders.email) LIKE LOWER('%${dtoFilter.email}%')`;
    }

    if (dtoFilter.tg) {
      filter += ` AND LOWER(shoporders.tg) LIKE LOWER('%${dtoFilter.tg}%')`;
    }

    if (dtoFilter.status) {
      filter += ` AND shoporders.status = '${dtoFilter.status}'`;
    }

    return filter;
  }
}
