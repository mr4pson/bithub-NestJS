import {
  Controller,
  Param,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { CShopordersService } from './shoporders.service';
import { CShoporder } from 'src/model/entities/shoporder';
import { IGetList } from 'src/model/dto/getlist.interface';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { CAdminGuard } from 'src/common/services/guards/admin.guard';

@Controller('api/admin/shoporders')
export class CShopordersController {
  constructor(private shopordersService: CShopordersService) {}

  @UseGuards(CAdminGuard)
  @Post('chunk')
  public chunk(@Body() dto: IGetList): Promise<IResponse<CShoporder[]>> {
    return this.shopordersService.chunk(dto);
  }

  @UseGuards(CAdminGuard)
  @Post('one/:id')
  public one(@Param('id') id: string): Promise<IResponse<CShoporder>> {
    return this.shopordersService.one(parseInt(id));
  }

  @UseGuards(CAdminGuard)
  @Post('delete/:id')
  public delete(@Param('id') id: string): Promise<IResponse<void>> {
    return this.shopordersService.delete(parseInt(id));
  }

  @UseGuards(CAdminGuard)
  @Post('delete-bulk')
  public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
    return this.shopordersService.deleteBulk(ids);
  }

  @UseGuards(CAdminGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('update')
  public update(@Body() fd: IJsonFormData): Promise<IResponse<CShoporder>> {
    return this.shopordersService.update(fd);
  }
}
