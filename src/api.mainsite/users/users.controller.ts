import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  Param,
} from '@nestjs/common';
import { IResponse } from 'src/model/dto/response.interface';
import { IUserLogin } from './dto/user.login.interface';
import { IUserAuthData } from './dto/user.authdata.interface';
import { CUsersService } from './users.service';
import { CUserGuard } from 'src/common/services/guards/user.guard';
import { JwtService } from '@nestjs/jwt';
import { IUser } from './dto/user.interface';
import { IUserVerify } from './dto/user.verify.interface';
import { IUserRegister } from './dto/user.register.interface';
import { IUserRecover } from './dto/user.recover.interface';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IUserUpdatePassword } from './dto/user.update.password.interface';
import { IUserEnterByToken } from './dto/user.enterbytoken.interface';

@Controller('api/mainsite/users')
export class CUsersController {
  constructor(
    private usersService: CUsersService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  public login(@Body() dto: IUserLogin): Promise<IResponse<IUserAuthData>> {
    return this.usersService.login(dto);
  }

  @UseGuards(CUserGuard)
  @Post('me')
  public me(@Req() request: Request): Promise<IResponse<IUser>> {
    const visitor_id = this.jwtService.decode(
      request.headers['token'] as string,
    )['id'] as number;
    return this.usersService.one(visitor_id, visitor_id, true);
  }

  @UseGuards(CUserGuard)
  @Post('one/:id')
  public one(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<IResponse<IUser>> {
    const visitor_id = this.jwtService.decode(
      request.headers['token'] as string,
    )['id'] as number;
    return this.usersService.one(parseInt(id), visitor_id);
  }

  @Post('can-be-parent/:uuid')
  public canBeParent(@Param('uuid') uuid: string): Promise<IResponse<void>> {
    return this.usersService.canBeParent(uuid);
  }

  @Post('is-exists/:uuid')
  public isExists(@Param('uuid') uuid: string): Promise<IResponse<void>> {
    return this.usersService.isExists(uuid);
  }

  @Post('create-verification')
  public createVerification(
    @Body() dto: IUserVerify,
  ): Promise<IResponse<void>> {
    return this.usersService.createVerification(dto);
  }

  @Post('verify')
  public verify(
    @Body() dto: { code: string },
    @Req() request: Request,
  ): Promise<IResponse<void>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.usersService.verify({ userId: visitor_id, code: dto.code });
  }

  @Post('register')
  public register(
    @Body() dto: IUserRegister,
    @Req() request: Request,
  ): Promise<IResponse<IUserAuthData>> {
    const tz = parseInt(request.headers['tz']);
    return this.usersService.register(dto, tz);
  }

  @Post('recover')
  public recover(@Body() dto: IUserRecover): Promise<IResponse<void>> {
    return this.usersService.recover(dto);
  }

  @Post('enter-by-token')
  public enterByToken(
    @Body() dto: IUserEnterByToken,
    @Req() request: Request,
  ): Promise<IResponse<IUserAuthData>> {
    const tz = parseInt(request.headers['tz']);
    return this.usersService.enterByToken(dto, tz);
  }

  @UseGuards(CUserGuard)
  @Post('children-chunk')
  public childrenChunk(
    @Body() dto: IGetList,
    @Req() request: Request,
  ): Promise<IResponse<IUser[]>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.usersService.childrenChunk(dto, visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('referees-chunk')
  public refereesChunk(
    @Body() dto: IGetList,
    @Req() request: Request,
  ): Promise<IResponse<IUser[]>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.usersService.refereesChunk(dto, visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('remove-subacc/:id')
  public removeSubacc(
    @Param('id') id: number,
    @Req() request: Request,
  ): Promise<IResponse<IUser[]>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.usersService.removeSubacc(id, visitor_id);
  }

  @UseGuards(CUserGuard)
  @UseInterceptors(
    AnyFilesInterceptor({ limits: { fieldSize: 1000 * 1024 * 1024 } }),
  )
  @Post('update-me')
  public updateMe(
    @Body() fd: IJsonFormData,
    @UploadedFiles() uploads: Express.Multer.File[],
    @Req() request: Request,
  ): Promise<IResponse<IUser>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'];
    return this.usersService.update(fd, uploads, visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('update-password')
  public updatePassword(
    @Body() dto: IUserUpdatePassword,
    @Req() request: Request,
  ): Promise<IResponse<void>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'];
    return this.usersService.updatePassword(dto, visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('deactivate')
  public deactivate(@Req() request: Request): Promise<IResponse<void>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.usersService.deactivate(visitor_id);
  }

  @UseGuards(CUserGuard)
  @Post('get-tg-invite')
  public getTgInvite(@Req() request: Request): Promise<IResponse<string>> {
    const token = request.headers['token'] as string;
    const visitor_id = this.jwtService.decode(token)['id'] as number;
    return this.usersService.getTgInvite(visitor_id);
  }
}
