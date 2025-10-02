import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { COwnerGuard } from 'src/common/services/guards/owner.guard';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CWithdraworder } from 'src/model/entities/withdraworder';
import { CWithdrawordersService } from './withdraworders.service';

@Controller('api/admin/withdraworders')
export class CWithdrawordersController {
  constructor(private withdrawordersService: CWithdrawordersService) {}

  @UseGuards(COwnerGuard)
  @Post('chunk')
  public chunk(@Body() dto: IGetList): Promise<IResponse<CWithdraworder[]>> {
    return this.withdrawordersService.chunk(dto);
  }

  @UseGuards(COwnerGuard)
  @Post('one/:id')
  public one(@Param('id') id: string): Promise<IResponse<CWithdraworder>> {
    return this.withdrawordersService.one(parseInt(id));
  }

  @UseGuards(COwnerGuard)
  @Post('delete/:id')
  public delete(@Param('id') id: string): Promise<IResponse<void>> {
    return this.withdrawordersService.delete(parseInt(id));
  }

  @UseGuards(COwnerGuard)
  @Post('delete-bulk')
  public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
    return this.withdrawordersService.deleteBulk(ids);
  }

  @UseGuards(COwnerGuard)
  @Post('complete')
  public complete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IResponse<string>> {
    return this.withdrawordersService.complete(id);
  }
}
