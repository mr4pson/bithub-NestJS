import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IResponse } from 'src/model/dto/response.interface';
import { IShopitem } from './dto/shopitem.interface';
import { CShopitemsService } from './shopitems.service';

@Controller('api/mainsite/shopitems')
export class CShopitemsController {
  constructor(private shopitemsService: CShopitemsService) {}

  @Post('chunk')
  public chunk(@Body() dto: IGetList): Promise<IResponse<IShopitem[]>> {
    return this.shopitemsService.chunk(dto);
  }

  @Post('one/:id')
  public one(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IResponse<IShopitem>> {
    return this.shopitemsService.one(id);
  }
}
