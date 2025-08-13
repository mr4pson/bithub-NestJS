import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { CUserGuard } from 'src/common/services/guards/user.guard';
import { CInordersService } from './inorders.service';
import { JwtService } from '@nestjs/jwt';
import { IInorderCreate } from './dto/inorder.create.interface';
import { IWpEvent } from './dto/whitepay';

@Controller('api/mainsite/inorders')
export class CInordersController {
  constructor(
    private inordersService: CInordersService,
    private jwtService: JwtService,
  ) {}

  @UseGuards(CUserGuard)
  @Post('create')
  public create(
    @Body() dto: IInorderCreate,
    @Req() request: Request,
  ): Promise<IResponse<string>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'];
    return this.inordersService.create(dto, visitor_id);
  }

  @Post('complete')
  public complete(
    @Body() dto: IWpEvent,
    @Req() request: Request,
  ): Promise<string> {
    const signature = request.headers['signature'] as string;
    return this.inordersService.complete(dto, signature);
  }
}
// SdBUXt+GXUB9pj+BR20xXvBJgPFPghWM
