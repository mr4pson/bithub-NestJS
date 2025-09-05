import { Controller, Post } from '@nestjs/common';
import { CShopcatsService } from './shopcats.service';
import { IResponse } from 'src/model/dto/response.interface';
import { IShopcat } from './dto/shopcat.interface';

@Controller('api/mainsite/shopcats')
export class CShopcatsController {
  constructor(private shopcatsService: CShopcatsService) {}

  @Post('all')
  public all(): Promise<IResponse<IShopcat[]>> {
    return this.shopcatsService.all();
  }
}
