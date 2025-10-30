import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import * as crypto from 'crypto';
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
import { cfg } from 'src/app.config';

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

  @Post('can-be-parent/:uuid/:index')
  public canBeParent(
    @Param('uuid') uuid: string,
    @Param('index') index: string,
  ): Promise<IResponse<void>> {
    return this.usersService.canBeParent(uuid, parseInt(index));
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

  @Post('unsubscribe/:uuid')
  public unsubscribe(@Param('uuid') uuid: string): Promise<IResponse<void>> {
    return this.usersService.unsubscribe(uuid);
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

  /**
   * Telegram login/register link handler
   * GET /api/mainsite/users/tg-login/:id?expires=...&userData=...&signature=...
   */
  @Get('tg-login/:id')
  public async tgLogin(
    @Param('id') id: string,
    @Query('expires') expires: string,
    @Query('userData') userData: string,
    @Query('signature') signature: string,
    @Req() request: Request,
  ): Promise<IResponse<IUserAuthData>> {
    try {
      const tz = parseInt(request.headers['tz']);

      if (!expires || !userData || !signature) {
        return { ok: false, error: 'invalid_request' } as any;
      }
      const now = Math.floor(Date.now() / 1000);
      if (parseInt(expires, 10) < now) {
        return { ok: false, error: 'expired' } as any;
      }
      const expected = crypto
        .createHmac('sha256', cfg.encryption.key)
        .update(`${userData}|${expires}`)
        .digest('hex');
      if (expected !== signature) {
        return { ok: false, error: 'invalid_signature' } as any;
      }
      const decoded = JSON.parse(
        Buffer.from(decodeURIComponent(userData), 'base64').toString('utf8'),
      );

      const user = await this.usersService.tgFindOrCreate(decoded, tz);
      if (!user) return { ok: false, error: 'internal_error' } as any;

      const payload = { id: user.id, role: 'user' };
      const token = this.jwtService.sign(payload);
      const result: IUserAuthData = { token, user } as any;
      return { ok: true, data: result } as any;
    } catch (err) {
      console.log(err);
      return { ok: false, error: 'internal_error' } as any;
    }
  }
}
