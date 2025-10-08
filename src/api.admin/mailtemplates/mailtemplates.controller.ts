import {
  Controller,
  Param,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { CMailtemplatesService } from './mailtemplates.service';
import { CMailtemplate } from 'src/model/entities/mailtemplate';
import { IGetList } from 'src/model/dto/getlist.interface';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { CAdminGuard } from 'src/common/services/guards/admin.guard';

@Controller('api/admin/mailtemplates')
export class CMailtemplatesController {
  constructor(private mailtemplatesService: CMailtemplatesService) {}

  @UseGuards(CAdminGuard)
  @Post('chunk')
  public chunk(@Body() dto: IGetList): Promise<IResponse<CMailtemplate[]>> {
    return this.mailtemplatesService.chunk(dto);
  }

  @UseGuards(CAdminGuard)
  @Post('one/:id')
  public one(@Param('id') id: string): Promise<IResponse<CMailtemplate>> {
    return this.mailtemplatesService.one(parseInt(id));
  }

  @UseGuards(CAdminGuard)
  @Post('delete/:id')
  public delete(@Param('id') id: string): Promise<IResponse<void>> {
    return this.mailtemplatesService.delete(parseInt(id));
  }

  @UseGuards(CAdminGuard)
  @Post('delete-bulk')
  public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
    return this.mailtemplatesService.deleteBulk(ids);
  }

  @UseGuards(CAdminGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('create')
  public create(@Body() fd: IJsonFormData): Promise<IResponse<CMailtemplate>> {
    return this.mailtemplatesService.create(fd);
  }

  @UseGuards(CAdminGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('update')
  public update(@Body() fd: IJsonFormData): Promise<IResponse<CMailtemplate>> {
    return this.mailtemplatesService.update(fd);
  }
}
