import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { CGuidesService } from './guides.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IGuide } from './dto/guide.interface';
import { CUserGuard } from 'src/common/services/guards/user.guard';
import { JwtService } from '@nestjs/jwt';
import { IFavoritionUpdate } from './dto/favorition.update.interface';
import { ICompletion } from './dto/completion.interface';

@Controller('api/mainsite/guides')
export class CGuidesController {
  constructor(
    private guidesService: CGuidesService,
    private jwtService: JwtService,
  ) {}

  @Post('chunk')
  public chunk(
    @Body() dto: IGetList,
    @Req() request: Request,
  ): Promise<IResponse<IGuide[]>> {
    const token = request.headers['token'] as string;
    const visitor_id = token
      ? (this.jwtService.decode(token)['id'] as number)
      : null;
    return this.guidesService.chunk(dto, visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('stat-chunk')
  public statChunk(
    @Body() dto: IGetList,
    @Req() request: Request,
  ): Promise<IResponse<IGuide[]>> {
    const token = request.headers['token'] as string;
    const visitor_id = token
      ? (this.jwtService.decode(token)['id'] as number)
      : null;
    return this.guidesService.statChunk(dto, visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('stat-completions/:id')
  public statCmpletions(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<IResponse<ICompletion[]>> {
    const token = request.headers['token'] as string;
    const visitor_id = token
      ? (this.jwtService.decode(token)['id'] as number)
      : null;
    return this.guidesService.statCompletions(id, visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('favorites-chunk')
  public favoritesChunk(
    @Body() dto: IGetList,
    @Req() request: Request,
  ): Promise<IResponse<IGuide[]>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.guidesService.favoritesChunk(dto, visitor_id);
  }

  @Post('one-by-slug/:slug')
  public oneBySlug(
    @Param('slug') slug: string,
    @Req() request: Request,
  ): Promise<IResponse<IGuide>> {
    const token = request.headers['token'] as string;
    const visitor_id = token
      ? (this.jwtService.decode(token)['id'] as number)
      : null;
    return this.guidesService.oneBySlug(slug, visitor_id);
  }

  // @UseGuards(CUserGuard)
  @Post('one/:id')
  public one(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<IResponse<IGuide>> {
    const token = request.headers['token'] as string;
    const visitor_id = token
      ? (this.jwtService.decode(token)['id'] as number)
      : undefined;
    return this.guidesService.one(parseInt(id), visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('update-favorition')
  public updateFavorition(
    @Body() dto: IFavoritionUpdate,
    @Req() request: Request,
  ): Promise<IResponse<void>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.guidesService.updateFavorition(dto, visitor_id);
  }

  /*
    @UseGuards(CUserGuard)
    @Post("update-reminder")
    public updateReminder(@Body() dto: IReminderUpdate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.guidesService.updateReminder(dto, visitor_id);
    }

    @UseGuards(CUserGuard)
    @Post("update-execution")
    public updateExecution(@Body() dto: IExecutionUpdate, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.guidesService.updateExecution(dto, visitor_id);
    }
        */
}
