import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { CShopitemsService } from './shopitems.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IShopitem } from './dto/shopitem.interface';
import { CUserGuard } from 'src/common/services/guards/user.guard';

@Controller('api/mainsite/shopitems')
export class CShopitemsController {
  constructor(private shopitemsService: CShopitemsService) {}

  @UseGuards(CUserGuard)
  @Post('chunk')
  public chunk(@Body() dto: IGetList): Promise<IResponse<IShopitem[]>> {
    return this.shopitemsService.chunk(dto);
  }

  @UseGuards(CUserGuard)
  @Post('one/:id')
  public one(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IResponse<IShopitem>> {
    return this.shopitemsService.one(id);
  }
}
