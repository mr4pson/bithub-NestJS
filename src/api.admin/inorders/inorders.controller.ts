import { Controller, Param, Post, Body, UseGuards } from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { CInordersService } from './inorders.service';
import { CInorder } from 'src/model/entities/inorder';
import { IGetList } from 'src/model/dto/getlist.interface';
import { COwnerGuard } from 'src/common/services/guards/owner.guard';
import { CAdminGuard } from 'src/common/services/guards/admin.guard';

@Controller('api/admin/inorders')
export class CInordersController {
  constructor(private inordersService: CInordersService) {}

  @UseGuards(CAdminGuard)
  @Post('chunk')
  public chunk(@Body() dto: IGetList): Promise<IResponse<CInorder[]>> {
    return this.inordersService.chunk(dto);
  }

  @UseGuards(COwnerGuard)
  @Post('one/:id')
  public one(@Param('id') id: string): Promise<IResponse<CInorder>> {
    return this.inordersService.one(parseInt(id));
  }

  @UseGuards(COwnerGuard)
  @Post('delete/:id')
  public delete(@Param('id') id: string): Promise<IResponse<void>> {
    return this.inordersService.delete(parseInt(id));
  }

  @UseGuards(COwnerGuard)
  @Post('delete-bulk')
  public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
    return this.inordersService.deleteBulk(ids);
  }
}
