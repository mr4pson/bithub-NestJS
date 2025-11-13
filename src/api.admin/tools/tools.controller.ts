import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CAdminGuard } from 'src/common/services/guards/admin.guard';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CTool } from 'src/model/entities/tool';
import { CToolsService } from './tools.service';

@Controller('api/admin/tools')
export class CToolsController {
  constructor(private toolsService: CToolsService) {}

  @UseGuards(CAdminGuard)
  @Post('chunk')
  public chunk(@Body() dto: IGetList): Promise<IResponse<CTool[]>> {
    return this.toolsService.chunk(dto);
  }

  @UseGuards(CAdminGuard)
  @Post('one/:id')
  public one(@Param('id') id: string): Promise<IResponse<CTool>> {
    return this.toolsService.one(parseInt(id));
  }

  @UseGuards(CAdminGuard)
  @Post('delete/:id')
  public delete(@Param('id') id: string): Promise<IResponse<void>> {
    return this.toolsService.delete(parseInt(id));
  }

  @UseGuards(CAdminGuard)
  @Post('delete-bulk')
  public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
    return this.toolsService.deleteBulk(ids);
  }

  @UseGuards(CAdminGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('create')
  public create(
    @Body() fd: IJsonFormData,
    @UploadedFiles() uploads: Express.Multer.File[],
  ): Promise<IResponse<CTool>> {
    return this.toolsService.create(fd, uploads);
  }

  @UseGuards(CAdminGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('update')
  public update(
    @Body() fd: IJsonFormData,
    @UploadedFiles() uploads: Express.Multer.File[],
  ): Promise<IResponse<CTool>> {
    return this.toolsService.update(fd, uploads);
  }
}
