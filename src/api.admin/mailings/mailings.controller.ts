import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CAdminGuard } from 'src/common/services/guards/admin.guard';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CMailing } from 'src/model/entities/mailing';
import { CMailingsService } from './mailings.service';

@Controller('api/admin/mailings')
export class CMailingsController {
  constructor(private mailingsService: CMailingsService) {}

  @UseGuards(CAdminGuard)
  @Post('chunk')
  public chunk(@Body() dto: IGetList): Promise<IResponse<CMailing[]>> {
    return this.mailingsService.chunk(dto);
  }

  @UseGuards(CAdminGuard)
  @Post('one/:id')
  public one(@Param('id') id: string): Promise<IResponse<CMailing>> {
    return this.mailingsService.one(parseInt(id));
  }

  @UseGuards(CAdminGuard)
  @Post('one-short/:id')
  public oneShort(@Param('id') id: string): Promise<IResponse<CMailing>> {
    return this.mailingsService.oneShort(parseInt(id));
  }

  @UseGuards(CAdminGuard)
  @Post('delete/:id')
  public delete(@Param('id') id: string): Promise<IResponse<void>> {
    return this.mailingsService.delete(parseInt(id));
  }

  @UseGuards(CAdminGuard)
  @Post('delete-bulk')
  public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
    return this.mailingsService.deleteBulk(ids);
  }

  @UseGuards(CAdminGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('create')
  public create(@Body() fd: IJsonFormData): Promise<IResponse<CMailing>> {
    return this.mailingsService.create(fd);
  }

  @UseGuards(CAdminGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('update')
  public update(@Body() fd: IJsonFormData): Promise<IResponse<CMailing>> {
    return this.mailingsService.update(fd);
  }

  @UseGuards(CAdminGuard)
  @Post('run/:id')
  public run(@Param('id') id: string): Promise<IResponse<void>> {
    return this.mailingsService.run(parseInt(id));
  }
}
