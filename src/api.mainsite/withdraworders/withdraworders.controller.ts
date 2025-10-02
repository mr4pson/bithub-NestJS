import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CUserGuard } from 'src/common/services/guards/user.guard';
import { IResponse } from 'src/model/dto/response.interface';
import { IWithdraworderCreate } from './dto/withdraworder.create.interface';
import { CWithdrawordersService } from './withdraworders.service';

@Controller('api/mainsite/withdraworders')
export class CWithdrawordersController {
  constructor(
    private withdrawordersService: CWithdrawordersService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(CUserGuard)
  @Post('create')
  public create(
    @Body() dto: IWithdraworderCreate,
    @Req() request: Request,
  ): Promise<IResponse<string>> {
    const token = request.headers['token'] as string;
    const user_id = this.jwtService.decode(token)['id'];

    return this.withdrawordersService.create(user_id, dto);
  }
}
