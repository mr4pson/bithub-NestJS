import {
  Controller,
  Param,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { CUsersService } from './users.service';
import { CUser } from 'src/model/entities/user';
import { IGetList } from 'src/model/dto/getlist.interface';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { ITgEvent } from './dto/tg.event.interface';
import { COwnerGuard } from 'src/common/services/guards/owner.guard';
import { CAdminGuard } from 'src/common/services/guards/admin.guard';

@Controller('api/admin/users')
export class CUsersController {
  constructor(private usersService: CUsersService) {}

  @UseGuards(CAdminGuard)
  @Post('chunk')
  public chunk(@Body() dto: IGetList): Promise<IResponse<CUser[]>> {
    return this.usersService.chunk(dto);
  }

  @UseGuards(CAdminGuard)
  @Post('one/:id')
  public one(@Param('id') id: string): Promise<IResponse<CUser>> {
    return this.usersService.one(parseInt(id));
  }

  @UseGuards(COwnerGuard)
  @Post('delete/:id')
  public delete(@Param('id') id: string): Promise<IResponse<void>> {
    return this.usersService.delete(parseInt(id));
  }

  @UseGuards(COwnerGuard)
  @Post('delete-bulk')
  public deleteBulk(@Body() ids: number[]): Promise<IResponse<void>> {
    return this.usersService.deleteBulk(ids);
  }

  @UseGuards(COwnerGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('create')
  public create(
    @Body() fd: IJsonFormData,
    @UploadedFiles() uploads: Express.Multer.File[],
  ): Promise<IResponse<CUser>> {
    return this.usersService.create(fd, uploads);
  }

  @UseGuards(COwnerGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('update')
  public update(
    @Body() fd: IJsonFormData,
    @UploadedFiles() uploads: Express.Multer.File[],
  ): Promise<IResponse<CUser>> {
    return this.usersService.update(fd, uploads);
  }

  @Post('tg-event')
  public onTgEvent(
    @Body() dto: ITgEvent,
    @Req() request: Request,
  ): Promise<void> {
    const token = request.headers['x-telegram-bot-api-secret-token'] as string;
    return this.usersService.onTgEvent(dto, token);
  }
}
