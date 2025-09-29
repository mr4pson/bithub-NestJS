import {
  Controller,
  Param,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { CMailingsService } from './mailings.service';
import { CMailing } from 'src/model/entities/mailing';
import { IGetList } from 'src/model/dto/getlist.interface';
import { COwnerGuard } from 'src/common/services/guards/owner.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';

@Controller('api/admin/mailings')
export class CMailingsController {
  constructor(private mailingsService: CMailingsService) {}

  @UseGuards(COwnerGuard)
  @Post('chunk')
  public chunk(@Body() dto: IGetList): Promise<IResponse<CMailing[]>> {
    return this.mailingsService.chunk(dto);
  }

  @UseGuards(COwnerGuard)
  @Post('one/:id')
  public one(@Param('id') id: string): Promise<IResponse<CMailing>> {
    return this.mailingsService.one(parseInt(id));
  }

  @UseGuards(COwnerGuard)
  @Post('one-short/:id')
  public oneShort(@Param('id') id: string): Promise<IResponse<CMailing>> {
    return this.mailingsService.oneShort(parseInt(id));
  }

  @UseGuards(COwnerGuard)
  @Post('delete/:id')
  public delete(@Param('id') id: string): Promise<IResponse<void>> {
    return this.mailingsService.delete(parseInt(id));
  }

  @UseGuards(COwnerGuard)
  @Post('delete-bulk')
  public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
    return this.mailingsService.deleteBulk(ids);
  }

  @UseGuards(COwnerGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('create')
  public create(@Body() fd: IJsonFormData): Promise<IResponse<CMailing>> {
    return this.mailingsService.create(fd);
  }

  @UseGuards(COwnerGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('update')
  public update(@Body() fd: IJsonFormData): Promise<IResponse<CMailing>> {
    return this.mailingsService.update(fd);
  }

  @UseGuards(COwnerGuard)
  @Post('run/:id')
  public run(@Param('id') id: string): Promise<IResponse<void>> {
    return this.mailingsService.run(parseInt(id));
  }
}
