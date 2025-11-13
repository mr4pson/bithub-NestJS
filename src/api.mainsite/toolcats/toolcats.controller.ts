import { Controller, Post } from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { IToolcat } from './dto/toolcat.interface';
import { CToolcatsService } from './toolcats.service';

@Controller('api/mainsite/toolcats')
export class CToolcatsController {
  constructor(private toolcatsService: CToolcatsService) {}

  @Post('all')
  public all(): Promise<IResponse<IToolcat[]>> {
    return this.toolcatsService.all();
  }
}
