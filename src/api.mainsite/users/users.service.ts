import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CAppService } from 'src/common/services/app.service';
import { CErrorsService } from 'src/common/services/errors.service';
import { CUser } from 'src/model/entities/user';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { IUserLogin } from './dto/user.login.interface';
import { IResponse } from 'src/model/dto/response.interface';
import { IUserAuthData } from './dto/user.authdata.interface';
import { IUser } from './dto/user.interface';
import { IUserVerify } from './dto/user.verify.interface';
import { CVerification } from 'src/model/entities/verification';
import { IUserRegister } from './dto/user.register.interface';
import { IUserRecover } from './dto/user.recover.interface';
import { CImagableService } from 'src/common/services/imagable.service';
import { CUploadsService } from 'src/common/services/uploads.service';
import { IKeyValue } from 'src/model/keyvalue.interface';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { IUserUpdate } from './dto/user.update.interface';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IUserUpdatePassword } from './dto/user.update.password.interface';
import { CMailService } from 'src/common/services/mailable/mail.service';
import { CCaptchaService } from 'src/common/services/captcha.service';
import { CAuthService } from 'src/common/services/auth.service';
import { IUserEnterByToken } from './dto/user.enterbytoken.interface';
import { CSetting } from 'src/model/entities/setting';
import { CTgApiService } from 'src/common/services/tg.api.service';
import { CReforder } from 'src/model/entities/reforder';
import { CLangsService } from 'src/api.admin/langs/langs.service';
import * as crypto from 'crypto';
import { cfg } from 'src/app.config';

@Injectable()
export class CUsersService extends CImagableService {
  protected entity = 'CUser';
  protected folder = 'users';
  protected resizeMap: IKeyValue<number> = { img: 300 };

  constructor(
    protected dataSource: DataSource,
    protected jwtService: JwtService,
    protected errorsService: CErrorsService,
    protected appService: CAppService,
    protected mailService: CMailService,
    protected authService: CAuthService,
    protected uploadsService: CUploadsService,
    protected captchaService: CCaptchaService,
    protected tgapiService: CTgApiService,
    protected langService: CLangsService,
  ) {
    super(uploadsService, dataSource);
  }

  public async login(dto: IUserLogin): Promise<IResponse<IUserAuthData>> {
    try {
      const captchared = await this.captchaService.verify(dto.captchaToken);

      if (!captchared)
        return { statusCode: 400, error: 'captcha verification failed' };
      const user = await this.authorize(dto);
      if (!user) return { statusCode: 401, error: 'Unauthorized' };
      const payload = { id: user.id };
      const data: IUserAuthData = {
        id: user.id,
        token: this.jwtService.sign(payload),
      };
      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.login',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async tgLogin(
    id: number,
    expires: string,
    userData: string,
    signature: string,
    tz: number,
  ): Promise<IResponse<IUserAuthData>> {
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
    const user = await this.tgFindOrCreate(decoded, tz);

    if (!user || id !== user.tg_id)
      return { ok: false, error: 'internal_error' } as any;

    const payload = { id: user.id };
    const data: IUserAuthData = {
      id: user.id,
      token: this.jwtService.sign(payload),
    };

    return { statusCode: 200, data };
  }

  public async enterByToken(
    dto: IUserEnterByToken,
    tz: number,
  ): Promise<IResponse<IUserAuthData>> {
    try {
      const userData = await this.authService[`parse${dto.type}Token`](
        dto.token,
      );
      if (!userData.email) return { statusCode: 400, error: 'no email' };
      let user = await this.dataSource
        .getRepository(CUser)
        .findOneBy({ email: userData.email });

      // new user
      if (!user) {
        user = this.dataSource.getRepository(CUser).create({
          lang_id: dto.lang_id,
          name: userData.name,
          email: userData.email,
          password: this.authService.buildHash(
            this.appService.randomString(6, 'full'),
          ),
          wallet: '',
          tz,
        });
        await this.dataSource.getRepository(CUser).save(user);
        this.messageOnRegister(user);
        const payload = { id: user.id };
        const data: IUserAuthData = {
          id: user.id,
          token: this.jwtService.sign(payload),
        };
        return { statusCode: 201, data };
      }

      // user exists
      if (!user.active)
        return { statusCode: 402, error: 'user exists but inactive' };
      const payload = { id: user.id };
      const data: IUserAuthData = {
        id: user.id,
        token: this.jwtService.sign(payload),
      };
      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.enterByToken',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(
    id: number,
    visitor_id: number,
    showRefEarnings = false,
  ): Promise<IResponse<IUser>> {
    try {
      const user = await this.getUser(id, 'id');

      if (!user) return { statusCode: 404, error: 'user not found' };

      if (!(user.id === visitor_id || user.parent_id === visitor_id))
        return { statusCode: 401, error: 'no permission' }; // можно загружать только себя и потомков

      let refEarnings: number | undefined;

      if (showRefEarnings) {
        const refOrders = await this.dataSource
          .getRepository(CReforder)
          .find({ where: { referrer_email: user.email } });
        refEarnings = refOrders.reduce((sum, ro) => sum + ro.amount, 0);
      }

      return { statusCode: 200, data: this.buildUser(user, refEarnings) };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.me',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async canBeParent(
    uuid: string,
    index: number,
  ): Promise<IResponse<void>> {
    try {
      const user = await this.getUser(uuid, 'uuid');

      if (!user) return { statusCode: 404, error: 'user not found' };

      if (index !== user.children_q + 1)
        return { statusCode: 406, error: 'Sub link is outdated' };

      if (!user) return { statusCode: 404, error: 'user not found' };

      if (user.children_limit <= user.children_q)
        return { statusCode: 409, error: 'children limit exhausted' };

      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.canBeParent',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async isExists(uuid: string): Promise<IResponse<void>> {
    try {
      let user = await this.getUser(uuid, 'ref_link');

      if (!user) {
        user = await this.getUser(uuid, 'uuid');
      }

      if (!user) return { statusCode: 404, error: 'user not found' };
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.isExists',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async unsubscribe(uuid: string): Promise<IResponse<void>> {
    try {
      const user = await this.getUser(uuid, 'uuid');
      if (!user) return { statusCode: 404, error: 'user not found' };

      user.subscribed = false;

      await this.dataSource.getRepository(CUser).save(user);

      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.unsubscribe',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async createVerification(dto: IUserVerify): Promise<IResponse<void>> {
    try {
      const login = dto.email;
      const code = this.appService.randomString(6, 'digits');

      await this.dataSource.getRepository(CVerification).delete({ login });

      const verification = this.dataSource
        .getRepository(CVerification)
        .create({ login, code });

      await this.dataSource.getRepository(CVerification).save(verification);
      await this.mailService.userEmailVerification(
        dto.email,
        dto.lang_id,
        code,
      );

      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.createVerification',
        err,
      );

      return { statusCode: 500, error };
    }
  }

  public async verify({ code, userId }: { code: string; userId: number }) {
    const user = await this.getUser(userId, 'id');
    // check code
    // const now = new Date();
    // const expiration = new Date(now.getTime() - 30 * 60 * 1000);
    const verification = await this.dataSource
      .getRepository(CVerification)
      .findOne({
        where: {
          login: user.email,
          code: code.trim(),
          // created_at: MoreThanOrEqual(expiration),
        },
      });

    console.log(verification, code);

    if (!verification) {
      return { statusCode: 401, error: 'code is incorrect' };
    }

    user.verified = true;

    await this.dataSource.getRepository(CUser).save(user);

    return { statusCode: 200 };
  }

  public async register(
    dto: IUserRegister,
    tz: number,
  ): Promise<IResponse<IUserAuthData>> {
    try {
      // check captcha
      const captchared = await this.captchaService.verify(dto.captchaToken);
      if (!captchared)
        return { statusCode: 400, error: 'captcha verification failed' };

      // check email
      let user = await this.dataSource
        .getRepository(CUser)
        .findOneBy({ email: dto.email });

      if (user) {
        return { statusCode: 409, error: 'e-mail already in use' };
      }

      // check parent
      let parent_id: number = null;

      if (dto.parent_uuid) {
        const parent = await this.getUser(dto.parent_uuid, 'uuid');
        if (!parent) return { statusCode: 410, error: 'parent not found' };
        if (parent.children_q >= parent.children_limit)
          return { statusCode: 411, error: 'children limit exhausted' };
        parent_id = parent.id;
      }

      // check referer
      let referrer_id: number = null;

      if (dto.referrer_uuid) {
        let referrer = await this.getUser(dto.referrer_uuid, 'ref_link');

        if (!referrer) {
          referrer = await this.getUser(dto.referrer_uuid, 'uuid');
        }

        if (!referrer) return { statusCode: 412, error: 'referrer not found' };
        referrer_id = referrer.id;
      }

      user = this.buildSafeCreate(dto, tz, parent_id, referrer_id);
      await this.dataSource.getRepository(CUser).save(user);
      this.messageOnRegister(user);
      const payload = { id: user.id };
      const data: IUserAuthData = {
        id: user.id,
        token: this.jwtService.sign(payload),
      };
      return { statusCode: 201, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.register',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async recover(dto: IUserRecover): Promise<IResponse<void>> {
    try {
      const user = await this.dataSource
        .getRepository(CUser)
        .findOne({ where: { email: dto.email, active: true } });

      if (!user) {
        return { statusCode: 404, error: 'e-mail not found' };
      }

      const now = new Date();
      const expiration = new Date(now.getTime() - 5 * 60 * 1000);
      const verification = await this.dataSource
        .getRepository(CVerification)
        .findOne({
          where: {
            login: dto.email,
            code: dto.code,
            created_at: MoreThanOrEqual(expiration),
          },
        });

      if (!verification) {
        return { statusCode: 401, error: 'code is incorrect' };
      }

      user.password = this.authService.buildHash(dto.password);
      await this.dataSource.getRepository(CUser).save(user);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.recover',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async update(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
    user_id: number,
  ): Promise<IResponse<IUser>> {
    try {
      const dto = JSON.parse(fd.data) as IUserUpdate;
      let user = this.buildSafeUpdate(user_id, dto); // возьмем именно то, что нужно, а не то, что пришлют
      const old = await this.dataSource
        .getRepository(CUser)
        .findOneBy({ id: user.id });
      await this.buildImg(user, uploads);

      const existingUser = await this.getUser(dto.ref_link, 'ref_link');
      const lang = await this.langService.one(user?.lang_id || 1); // set default lang for templates
      const slug = lang.data.slug || 'en';

      if (existingUser && existingUser.id !== user.id) {
        return {
          statusCode: 500,
          error:
            slug === 'en'
              ? 'User with the same referral username already exists.'
              : slug === 'ru'
              ? 'Пользователь с таким же именем реферала уже существует.'
              : 'Користувач із таким самим іменем користувача реферала вже існує.',
        };
      }

      await this.dataSource.getRepository(CUser).save(user);
      await this.deleteUnbindedImgOnUpdate(user, old);
      user = await this.getUser(user.id, 'id');
      const data = this.buildUser(user);
      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.update',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async removeSubacc(subacc_id: number, user_id: number) {
    try {
      const subacc = await this.dataSource
        .getRepository(CUser)
        .findOneBy({ parent_id: user_id, id: subacc_id });

      if (!subacc) {
        return {
          statusCode: 400,
          error: `This user doesn't belong to this accounnt`,
        };
      }

      await this.dataSource.getRepository(CUser).delete({ id: subacc_id });

      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.removeSubacc',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async updatePassword(
    dto: IUserUpdatePassword,
    user_id: number,
  ): Promise<IResponse<void>> {
    try {
      // здесь не будем проверять юзера на существование и активность, потому что такие случаи не пропустит CUsersGuard
      const user = await this.dataSource
        .getRepository(CUser)
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where(`user.id='${user_id}'`)
        .getOne();

      if (
        !(await this.authService.compareHash(dto.oldpassword, user.password))
      ) {
        return { statusCode: 401, error: 'password invalid' };
      }

      user.password = this.authService.buildHash(dto.newpassword);
      await this.dataSource.getRepository(CUser).save(user);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.updatePassword',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async childrenChunk(
    dto: IGetList,
    user_id: number,
  ): Promise<IResponse<IUser[]>> {
    try {
      const sortBy = `users.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      const filter = this.buildChildrenFilter(dto.filter, user_id);
      const users = await this.dataSource
        .getRepository(CUser)
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.parent', 'parent')
        .where(filter)
        .orderBy({ [sortBy]: sortDir })
        .take(dto.q)
        .skip(dto.from)
        .getMany();
      const elementsQuantity = await this.dataSource
        .getRepository(CUser)
        .createQueryBuilder('users')
        .where(filter)
        .getCount();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      const data = users.map((u) => this.buildUser(u));
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.childrenChunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async refereesChunk(
    dto: IGetList,
    user_id: number,
  ): Promise<IResponse<IUser[]>> {
    try {
      const sortBy = `users.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      const filter = this.buildRefereesFilter(dto.filter, user_id);
      const users = await this.dataSource
        .getRepository(CUser)
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.parent', 'parent')
        .where(filter)
        .orderBy({ [sortBy]: sortDir })
        .take(dto.q)
        .skip(dto.from)
        .getMany();
      const elementsQuantity = await this.dataSource
        .getRepository(CUser)
        .createQueryBuilder('users')
        .where(filter)
        .getCount();
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      const data = users.map((u) => this.buildUser(u));
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.refereesChunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async deactivate(user_id: number): Promise<IResponse<void>> {
    try {
      await this.dataSource
        .getRepository(CUser)
        .update({ id: user_id }, { active: false });
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.deactivate',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async getTgInvite(user_id: number): Promise<IResponse<string>> {
    try {
      const user = await this.dataSource
        .getRepository(CUser)
        .findOne({ where: { id: user_id } });

      // у юзера есть ссылка
      if (user.tg_invite) {
        return { statusCode: 200, data: user.tg_invite };
      }

      // у юзера нет ссылки, но она ему положена
      if (user.paid_until && user.paid_until.getTime() > new Date().getTime()) {
        const groupName = (
          await this.dataSource
            .getRepository(CSetting)
            .findOneBy({ p: 'tgapi-group' })
        )?.v;
        if (!groupName)
          return { statusCode: 500, error: 'no Telegram group setting' };
        const invite = await this.tgapiService.getGroupInviteLink(groupName);
        if (!invite)
          return { statusCode: 500, error: 'Telegram API request failed' };
        user.tg_invite = invite;
        await this.dataSource.getRepository(CUser).save(user);
        return { statusCode: 200, data: user.tg_invite };
      }

      return { statusCode: 401, error: 'only for user with subscription' };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CUsersService.getTgInvite',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  ////////////////
  // utils
  ////////////////

  private buildChildrenFilter(
    dtoFilter: IKeyValue<any>,
    user_id: number,
  ): string {
    let filter = `users.active='1' AND users.parent_id='${user_id}'`;

    if (dtoFilter.created_at_less) {
      filter += ` AND users.created_at <= '${this.appService.mysqlDate(
        new Date(dtoFilter.created_at_less),
        'datetime',
      )}'`;
    }

    return filter;
  }

  private buildRefereesFilter(
    dtoFilter: IKeyValue<any>,
    user_id: number,
  ): string {
    let filter = `users.active='1' AND users.referrer_id='${user_id}'`;

    if (dtoFilter.created_at_less) {
      filter += ` AND users.created_at <= '${this.appService.mysqlDate(
        new Date(dtoFilter.created_at_less),
        'datetime',
      )}'`;
    }

    return filter;
  }

  private async authorize(dto: IUserLogin): Promise<CUser> {
    const user = await this.dataSource
      .getRepository(CUser)
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where({ email: dto.email })
      .getOne();

    if (
      user?.active &&
      (await this.authService.compareHash(dto.password, user.password))
    ) {
      return user;
    }

    return null;
  }

  private getUser(
    identifier: number | string,
    field: 'id' | 'uuid' | 'ref_link',
  ): Promise<CUser> {
    return this.dataSource
      .getRepository(CUser)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.parent', 'parent')
      .loadRelationCountAndMap('user.children_q', 'user.children')
      .where(`user.${field}='${identifier}' AND user.active='1'`)
      .getOne();
  }

  private buildSafeUpdate(user_id: number, dto: IUserUpdate): CUser {
    return this.dataSource.getRepository(CUser).create({
      id: user_id,
      lang_id: dto.lang_id,
      name: dto.name,
      wallet: dto.wallet,
      img: dto.img,
      ref_link: dto.ref_link,
      tg_username: dto.tg_username,
      tg_tasks: dto.tg_tasks,
      tg_guides: dto.tg_guides,
      tg_articles: dto.tg_articles,
      tg_deadlines: dto.tg_deadlines,
      tz: dto.tz,
    });
  }

  private buildSafeCreate(
    dto: IUserRegister,
    tz: number,
    parent_id: number,
    referrer_id: number,
  ): CUser {
    return this.dataSource.getRepository(CUser).create({
      lang_id: dto.lang_id,
      name: dto.name,
      email: dto.email.trim(),
      password: this.authService.buildHash(dto.password),
      wallet: dto.wallet,
      subType: null,
      tg_active: true,
      tz,
      parent_id,
      referrer_id,
    });
  }

  private buildUser(user: CUser, refEarnings?: number): IUser {
    return {
      id: user.id,
      uuid: user.uuid,
      lang_id: user.lang_id,
      parent_id: user.parent_id,
      referrer_id: user.referrer_id,
      email: user.email,
      name: user.name,
      wallet: user.wallet,
      img: user.img,
      money: user.money,
      points: user.points,
      subType: user.parent_id ? user.parent.subType : user.subType,
      paid_at: user.parent_id ? user.parent.paid_at : user.paid_at,
      paid_until: user.parent_id ? user.parent.paid_until : user.paid_until,
      freetasks: user.parent_id ? user.parent?.freetasks : user.freetasks,
      children_limit: user.children_limit,
      children_q: user.children_q,
      verified: user.verified,
      overdue:
        user.paid_until && user.paid_until.getTime() < new Date().getTime(),
      referral_percent: user.referral_percent,
      referral_buy_percent: user.referral_buy_percent,
      refEarnings,
      ref_link: user.ref_link,
      tg_username: user.tg_username,
      tg_tasks: user.tg_tasks,
      tg_guides: user.tg_guides,
      tg_articles: user.tg_articles,
      tg_deadlines: user.tg_deadlines,
      tz: user.tz,
      created_at: user.created_at,
    };
  }

  private async messageOnRegister(user: CUser): Promise<void> {
    try {
      await this.mailService.userRegister(user);
    } catch (err) {
      await this.errorsService.log(
        'api.mainsite/CUsersService.messageOnRegister',
        err,
      );
    }
  }

  public async canSeePaidContent(user_id: number): Promise<boolean> {
    if (!user_id) return false;
    const now = new Date();
    const user = await this.dataSource
      .getRepository(CUser)
      .findOne({ where: { id: user_id, active: true }, relations: ['parent'] });
    if (!user) return false;
    if (!user.parent_id)
      return user.paid_until && user.paid_until.getTime() > now.getTime();
    return (
      user.parent.active &&
      user.parent.paid_until &&
      user.parent.paid_until.getTime() > now.getTime()
    );
  }

  public async tgFindOrCreate(tgData: any, tz: number): Promise<CUser | null> {
    try {
      const tgId = tgData.id;

      if (!tgId) return null;

      const repo = this.dataSource.getRepository(CUser);
      const user = await repo.findOne({ where: { tg_id: tgId } });

      if (!user) {
        const payload = {
          active: true,
          tg_id: tgId,
          login: tgData.username ? `tg_${tgData.username}` : `tg_${tgId}`,
          name: tgData.first_name || '',
          last_name: tgData.last_name || '',
          lang_id: 1,
          tz,
        } as IUserRegister;

        this.buildSafeCreate(payload, tz, null, null);
        await repo.save(user);
      } else {
        let changed = false;

        if (tgData.first_name && user.name !== tgData.first_name) {
          user.name = `${tgData.first_name} ${tgData.last_name || ''}`;
          changed = true;
        }

        if (changed) await repo.save(user);
      }
      return user;
    } catch (err) {
      await this.errorsService.log('CUsersService.tgFindOrCreate', err);
      return null;
    }
  }
}
