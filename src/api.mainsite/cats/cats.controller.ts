import { Controller, Post } from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { CCatsService } from './cats.service';
import { ICat } from './dto/cat.interface';

@Controller('api/mainsite/cats')
export class CCatsController {
  constructor(private catsService: CCatsService) {}

  @Post('all')
  public all(): Promise<IResponse<ICat[]>> {
    return this.catsService.all();
  }
}
