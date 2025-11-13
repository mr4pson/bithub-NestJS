import {
  Controller,
  Param,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { CToolcatsService } from './toolcats.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { CAdminGuard } from 'src/common/services/guards/admin.guard';
import { CToolcat } from 'src/model/entities/toolcat';

@Controller('api/admin/toolcats')
export class CToolcatsController {
  constructor(private toolcatsService: CToolcatsService) {}

  @UseGuards(CAdminGuard)
  @Post('chunk')
  public chunk(@Body() dto: IGetList): Promise<IResponse<CToolcat[]>> {
    return this.toolcatsService.chunk(dto);
  }

  @UseGuards(CAdminGuard)
  @Post('one/:id')
  public one(@Param('id') id: string): Promise<IResponse<CToolcat>> {
    return this.toolcatsService.one(parseInt(id));
  }

  @UseGuards(CAdminGuard)
  @Post('delete/:id')
  public delete(@Param('id') id: string): Promise<IResponse<void>> {
    return this.toolcatsService.delete(parseInt(id));
  }

  @UseGuards(CAdminGuard)
  @Post('delete-bulk')
  public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
    return this.toolcatsService.deleteBulk(ids);
  }

  @UseGuards(CAdminGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('create')
  public create(@Body() fd: IJsonFormData): Promise<IResponse<CToolcat>> {
    return this.toolcatsService.create(fd);
  }

  @UseGuards(CAdminGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('update')
  public update(@Body() fd: IJsonFormData): Promise<IResponse<CToolcat>> {
    return this.toolcatsService.update(fd);
  }
}
