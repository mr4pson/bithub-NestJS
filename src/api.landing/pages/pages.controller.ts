import { Controller, Param, Post } from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { CPagesService } from './pages.service';
import { IPage } from './dto/page.interface';

@Controller('api/landing/pages')
export class CPagesController {
  constructor(private pagesService: CPagesService) {}

  @Post('one/:slug')
  public one(@Param('slug') slug: string): Promise<IResponse<IPage>> {
    return this.pagesService.one(slug);
  }
}
