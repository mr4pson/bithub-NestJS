import { Controller, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { IGetList } from 'src/model/dto/getlist.interface';
import { JwtService } from '@nestjs/jwt';
import { CUserGuard } from 'src/common/services/guards/user.guard';
import { IReadingUpdate } from './dto/reading.update.interface';
import { CToolsService } from './tools.service';
import { ITool } from './dto/tool.interface';

@Controller('api/mainsite/tools')
export class CToolsController {
  constructor(
    private toolsService: CToolsService,
    private jwtService: JwtService,
  ) {}

  @Post('chunk')
  public chunk(
    @Body() dto: IGetList,
    @Req() request: Request,
  ): Promise<IResponse<ITool[]>> {
    const token = request.headers['token'] as string;
    const visitor_id = token
      ? (this.jwtService.decode(token)['id'] as number)
      : null;
    return this.toolsService.chunk(dto, visitor_id);
  }

  @Post('one/:slug')
  public one(
    @Param('slug') slug: string,
    @Req() request: Request,
  ): Promise<IResponse<ITool>> {
    const token = request.headers['token'] as string;
    const visitor_id = token
      ? (this.jwtService.decode(token)['id'] as number)
      : null;
    return this.toolsService.one(slug, visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('update-reading')
  public updateReading(
    @Body() dto: IReadingUpdate,
    @Req() request: Request,
  ): Promise<IResponse<void>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.toolsService.updateReading(dto, visitor_id);
  }
}
