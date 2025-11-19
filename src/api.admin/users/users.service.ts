import { Injectable } from '@nestjs/common';
import { CAppService } from 'src/common/services/app.service';
import { CErrorsService } from 'src/common/services/errors.service';
import { CImagableService } from 'src/common/services/imagable.service';
import { CUploadsService } from 'src/common/services/uploads.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { IResponse } from 'src/model/dto/response.interface';
import { CUser } from 'src/model/entities/user';
import { IKeyValue } from 'src/model/keyvalue.interface';
import { DataSource, In } from 'typeorm';
import { IUserCreate } from './dto/user.create.interface';
import { IUserUpdate } from './dto/user.update.interface';
import { ITgEvent, ITgFrom } from './dto/tg.event.interface';
import { CSetting } from 'src/model/entities/setting';
import { CTgBotService } from 'src/common/services/mailable/tg.bot.service';
import { CAuthService } from 'src/common/services/auth.service';
import * as util from 'util';
import { cfg } from 'src/app.config';
import * as crypto from 'crypto';
import { CLang } from 'src/model/entities/lang';

@Injectable()
export class CUsersService extends CImagableService {
  protected entity = 'CUser';
  protected folder = 'users';
  protected resizeMap: IKeyValue<number> = { img: 300 };
  private steps: Record<number, 'email'> = {};

  constructor(
    protected dataSource: DataSource,
    protected uploadsService: CUploadsService,
    protected appService: CAppService,
    protected authService: CAuthService,
    protected errorsService: CErrorsService,
    protected tgBotService: CTgBotService,
  ) {
    super(uploadsService, dataSource);
  }

  public async chunk(dto: IGetList): Promise<IResponse<CUser[]>> {
    try {
      // хотя данная сущность имеет древесную структуру, здесь не будем строить дерево, потому что при фильтрации будет спорная концепция вывода - то ли выводить деревом и выполнять фильтр по потомкам, что сложновато, то ли при фильтрации дерево не использовать...
      const filter = this.buildFilter(dto.filter);
      const sortBy = `users.${dto.sortBy}`;
      const sortDir = dto.sortDir === 1 ? 'ASC' : 'DESC';
      const data = await this.dataSource
        .getRepository(CUser)
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.parent', 'parent')
        .leftJoinAndSelect('users.referrer', 'referrer')
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
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CUsersService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(id: number): Promise<IResponse<CUser>> {
    try {
      const data = await this.dataSource
        .getRepository(CUser)
        .findOne({ where: { id } });
      return data
        ? { statusCode: 200, data }
        : { statusCode: 404, error: 'user not found' };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CUsersService.one',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async delete(id: number): Promise<IResponse<void>> {
    try {
      const x = await this.dataSource.getRepository(CUser).findOneBy({ id });
      await this.deleteUnbindedImgOnDelete([x], true);
      await this.dataSource.getRepository(CUser).delete(id);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CUsersService.delete',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
    try {
      const xl = await this.dataSource
        .getRepository(CUser)
        .findBy({ id: In(ids) });
      await this.deleteUnbindedImgOnDelete(xl, true);
      await this.dataSource.getRepository(CUser).delete(ids);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CUsersService.deleteBulk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async create(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
  ): Promise<IResponse<CUser>> {
    try {
      const dto = JSON.parse(fd.data) as IUserCreate;
      const x = this.dataSource.getRepository(CUser).create(dto);
      await this.buildImg(x, uploads);
      x.password = this.authService.buildHash(x.password);
      await this.dataSource.getRepository(CUser).save(x);
      return { statusCode: 201, data: this.safeData(x) };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CUsersService.create',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async update(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
  ): Promise<IResponse<CUser>> {
    try {
      const dto = JSON.parse(fd.data) as IUserUpdate;
      const x = this.dataSource.getRepository(CUser).create(dto);
      const old = await this.dataSource
        .getRepository(CUser)
        .findOneBy({ id: x.id });
      await this.buildImg(x, uploads);
      await this.deleteUnbindedImgOnUpdate(x, old); // if img changed then delete old file

      if (x.password) {
        x.password = this.authService.buildHash(dto.password);
      } else {
        delete x.password; // if we got empty or null password, then it will not change in DB
      }

      await this.dataSource.getRepository(CUser).save(x);
      return { statusCode: 200, data: this.safeData(x) };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CUsersService.update',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async onTgEvent(dto: ITgEvent, token: string): Promise<void> {
    try {
      const from = dto.message.from;
      const langId = await this.getLangId(from.language_code);
      const tgbotWhToken = (
        await this.dataSource
          .getRepository(CSetting)
          .findOneBy({ p: 'tgbot-whtoken' })
      )?.v;
      if (!tgbotWhToken) throw 'tgbot-whtoken not found in settings';
      if (tgbotWhToken !== token) return;
      console.log(
        util.inspect(dto, { showHidden: false, depth: null, colors: true }),
      );

      // Telegrame start message handling
      if (dto.message?.text?.includes('/start')) {
        delete this.steps[from.id];

        const user = await this.dataSource
          .getRepository(CUser)
          .findOneBy({ tg_id: from.id });

        if (!user) {
          // ask user to provide email to bind account
          this.steps[from.id] = 'email';

          await this.tgBotService.userVerifyEmail(from.id, langId);

          return;
        }

        await this.authenticateTgUser(from, langId);
      }

      // handle incoming plain email replies to bind account
      if (dto.message?.text && this.steps[from.id] === 'email') {
        const text = dto.message.text.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (emailRegex.test(text)) {
          try {
            const foundUser = await this.dataSource
              .getRepository(CUser)
              .findOne({ where: { email: text } });
            if (foundUser) {
              if (foundUser.tg_id) {
                await this.tgBotService.userEmailAlreadyLinked(from.id, langId);

                return;
              }

              foundUser.tg_id = from.id;
              foundUser.tg_active = true;
              foundUser.tg_username = from.username;

              await this.dataSource.getRepository(CUser).save(foundUser);
              await this.tgBotService.userEmailLinkedSuccessfully(
                from.id,
                langId,
              );
            }

            await this.authenticateTgUser(from, langId, text);

            delete this.steps[from.id];
          } catch (e) {
            await this.errorsService.log(
              'api.admin/CUsersService.onTgEvent.emailBind',
              e,
            );
          }
          return;
        } else {
          await this.tgBotService.userEmailInvalid(from.id, langId);
          return;
        }
      }

      // деактивация telegram-уведомлений
      if (dto.my_chat_member?.new_chat_member?.status === 'kicked') {
        const tg_id = dto.my_chat_member.from.id;
        const user = await this.dataSource
          .getRepository(CUser)
          .findOneBy({ tg_id });
        if (!user) return;
        user.tg_active = false; // не удаляем, а деактивируем, чтобы можно было реактивировать
        await this.dataSource.getRepository(CUser).save(user);
        return;
      }
    } catch (err) {
      await this.errorsService.log('api.admin/CUsersService.onTgEvent', err);
    }
  }

  private async authenticateTgUser(
    from: ITgFrom,
    langId: number,
    email?: string,
  ): Promise<void> {
    try {
      const tgId = from.id;
      const userDataJson = {
        id: from.id,
        first_name: from.first_name || null,
        is_bot: from.is_bot || null,
        email: email,
        username: from.username || null,
        language_code: from.language_code || null,
      };
      // raw base64 (to be signed), URL-encode only for the query parameter
      const userDataB64 = Buffer.from(JSON.stringify(userDataJson)).toString(
        'base64',
      );
      const userDataParam = encodeURIComponent(userDataB64);
      const expires = Math.floor(Date.now() / 1000) + 5 * 60; // 5 minutes
      const signPayload = `${userDataB64}|${expires}`;
      const signature = crypto
        .createHmac('sha256', cfg.encryption.key)
        .update(signPayload)
        .digest('hex');

      const url = `${cfg.mainsiteUrl}/${from.language_code}/login/${tgId}?expires=${expires}&userData=${userDataParam}&signature=${signature}`;

      await this.tgBotService.userAuthenticate(tgId, langId, url);
    } catch (err) {
      await this.errorsService.log(
        'api.admin/CUsersService.authenticateTgUser',
        err,
      );
    }
  }

  private async getLangId(languageCode: string) {
    let lang = await this.dataSource
      .getRepository(CLang)
      .findOne({ where: { slug: languageCode } });

    if (!lang) {
      lang = await this.dataSource
        .getRepository(CLang)
        .findOneBy({ slug: 'en' });
    }

    return lang.id;
  }

  //////////////////////
  // utils
  //////////////////////

  private safeData(x: CUser): CUser {
    delete x.password;
    return x;
  }

  private buildFilter(dtoFilter: any): string {
    let filter = 'TRUE';

    if (dtoFilter.from !== undefined) {
      filter += ` AND users.created_at >= '${dtoFilter.from}'`;
    }

    if (dtoFilter.to !== undefined) {
      filter += ` AND users.created_at <= '${dtoFilter.to}'`;
    }

    if (dtoFilter.email) {
      filter += ` AND LOWER(users.email) LIKE LOWER('%${dtoFilter.email}%')`;
    }

    if (dtoFilter.name) {
      filter += ` AND LOWER(users.name) LIKE LOWER('%${dtoFilter.name}%')`;
    }

    if (dtoFilter.tg_username) {
      filter += ` AND LOWER(users.tg_username) LIKE LOWER('%${dtoFilter.tg_username}%')`;
    }

    if (dtoFilter.search) {
      filter += ` AND (LOWER(users.name) LIKE LOWER('%${dtoFilter.search}%') OR LOWER(users.email) LIKE LOWER('%${dtoFilter.search}%') OR users.id='${dtoFilter.search}')`;
    }

    if (dtoFilter.parent_id !== undefined) {
      if (dtoFilter.parent_id === null) {
        filter += ` AND users.parent_id IS NULL`;
      } else {
        filter += ` AND users.parent_id = '${dtoFilter.parent_id}'`;
      }
    }

    if (dtoFilter.referrer_id !== undefined) {
      if (dtoFilter.referrer_id === null) {
        filter += ` AND users.referrer_id IS NULL`;
      } else {
        filter += ` AND users.referrer_id = '${dtoFilter.referrer_id}'`;
      }
    }

    return filter;
  }

  private async fakeInit(): Promise<void> {
    for (let i = 0; i < 100; i++) {
      const user = new CUser().fakeInit(i, null, 1, this.authService.buildHash);
      await this.dataSource.getRepository(CUser).save(user);
    }
  }
}
