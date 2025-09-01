import { Controller, Post, UseGuards, Param, Body, Req } from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { CTasksService } from './tasks.service';
import { ITask } from './dto/task.interface';
import { CUserGuard } from 'src/common/services/guards/user.guard';
import { JwtService } from '@nestjs/jwt';
import { ICompletionUpdate } from './dto/completion.update.interface';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IViewed } from './dto/viewed.interface';

@Controller('api/mainsite/tasks')
export class CTasksController {
  constructor(
    private tasksService: CTasksService,
    private jwtService: JwtService,
  ) {}

  // @UseGuards(CUserGuard)
  @Post('paid-one/:id')
  public paidOne(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<IResponse<ITask>> {
    const token = request.headers['token'] as string;
    const visitor_id = ((token && this.jwtService.decode(token)) ?? {})[
      'id'
    ] as number;
    return this.tasksService.paidOne(parseInt(id), visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('one/:id')
  public one(@Param('id') id: string): Promise<IResponse<ITask>> {
    return this.tasksService.one(parseInt(id));
  }

  @UseGuards(CUserGuard)
  @Post('update-completion')
  public updateCompletion(
    @Body() dto: ICompletionUpdate,
    @Req() request: Request,
  ): Promise<IResponse<void>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.tasksService.updateCompletion(dto, visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('unviewed-chunk')
  public unviewedChunk(
    @Body() dto: IGetList,
    @Req() request: Request,
  ): Promise<IResponse<ITask[]>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.tasksService.unviewedChunk(dto, visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('unviewed-quantity/:favorites')
  public unviewedQuantity(
    @Param('favorites') favorites: string,
    @Req() request: Request,
  ): Promise<IResponse<number>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.tasksService.unviewedQuantity(favorites === 'true', visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('viewed')
  public viewed(
    @Body() dto: IViewed,
    @Req() request: Request,
  ): Promise<IResponse<number[]>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.tasksService.viewed(dto, visitor_id);
  }
}
