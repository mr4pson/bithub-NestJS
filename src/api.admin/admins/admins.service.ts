import { Injectable } from '@nestjs/common';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { CAdmin } from 'src/model/entities/admin';
import { IResponse } from 'src/model/dto/response.interface';
import { IAdminCreate } from './dto/admin.create.interface';
import { IAdminUpdate } from './dto/admin.update.interface';
import { CAppService } from 'src/common/services/app.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { CUploadsService } from 'src/common/services/uploads.service';
import { CImagableService } from 'src/common/services/imagable.service';
import { IKeyValue } from 'src/model/keyvalue.interface';
import { CVerification } from 'src/model/entities/verification';
import { CErrorsService } from 'src/common/services/errors.service';
import { IJsonFormData } from 'src/model/dto/json.formdata,interface';
import { IAdminLogin } from 'src/model/dto/admin.login.interface';
import { IAdminAuthData } from 'src/model/dto/admin.authdata.interface';
import { JwtService } from '@nestjs/jwt';
import { IAdminVerify } from 'src/model/dto/admin.verify.interface';
import { IAdminRecovery } from 'src/model/dto/admin.recovery.interface';
import { CMailService } from 'src/common/services/mailable/mail.service';
import { CAuthService } from 'src/common/services/auth.service';

@Injectable()
export class CAdminsService extends CImagableService {
  protected entity = 'CAdmin';
  protected folder = 'admins';
  protected resizeMap: IKeyValue<number> = { img: 200 };

  constructor(
    protected dataSource: DataSource,
    protected mailService: CMailService,
    protected appService: CAppService,
    protected uploadsService: CUploadsService,
    protected errorsService: CErrorsService,
    protected authService: CAuthService,
    protected jwtService: JwtService,
  ) {
    super(uploadsService, dataSource);
  }

  public async chunk(dto: IGetList): Promise<IResponse<CAdmin[]>> {
    try {
      const data = await this.dataSource.getRepository(CAdmin).find({
        where: { hidden: false },
        order: { [dto.sortBy]: dto.sortDir },
        take: dto.q,
        skip: dto.from,
        relations: ['group'],
      });
      const elementsQuantity = await this.dataSource
        .getRepository(CAdmin)
        .count({ where: { hidden: false } });
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CAdminsService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async one(id: number): Promise<IResponse<CAdmin>> {
    try {
      const data = await this.dataSource
        .getRepository(CAdmin)
        .findOneBy({ id });
      return data
        ? { statusCode: 200, data }
        : { statusCode: 404, error: 'admin not found' };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CAdminsService.one',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async delete(id: number): Promise<IResponse<void>> {
    try {
      const x = await this.dataSource.getRepository(CAdmin).findOneBy({ id });
      await this.deleteUnbindedImgOnDelete([x], false);
      await this.dataSource.getRepository(CAdmin).delete(id);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CAdminsService.delete',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
    try {
      const xl = await this.dataSource.getRepository(CAdmin).findByIds(ids);
      await this.deleteUnbindedImgOnDelete(xl, false);
      await this.dataSource.getRepository(CAdmin).delete(ids);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CAdminsService.deleteBulk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async create(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
  ): Promise<IResponse<CAdmin>> {
    try {
      const dto = JSON.parse(fd.data) as IAdminCreate;
      const x = this.dataSource.getRepository(CAdmin).create(dto);
      await this.buildImg(x, uploads);
      x.password = this.authService.buildHash(x.password);
      await this.dataSource.getRepository(CAdmin).save(x);
      return { statusCode: 201, data: this.safeData(x) };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CAdminsService.create',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async update(
    fd: IJsonFormData,
    uploads: Express.Multer.File[],
  ): Promise<IResponse<CAdmin>> {
    try {
      const dto = JSON.parse(fd.data) as IAdminUpdate;
      const x = this.dataSource.getRepository(CAdmin).create(dto);
      const old = await this.dataSource
        .getRepository(CAdmin)
        .findOneBy({ id: x.id });
      await this.buildImg(x, uploads);
      await this.deleteUnbindedImgOnUpdate(x, old); // if img changed then delete old file

      if (x.password) {
        x.password = this.authService.buildHash(dto.password);
      } else {
        delete x.password; // if we got empty or null password, then it will not change in DB
      }

      await this.dataSource.getRepository(CAdmin).save(x);
      return { statusCode: 200, data: this.safeData(x) };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CAdminsService.update',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async login(dto: IAdminLogin): Promise<IResponse<IAdminAuthData>> {
    try {
      const admin = await this.authorize(dto.email, dto.password);

      if (!admin) {
        return { statusCode: 401, error: 'Unauthorized' };
      }

      const payload = { id: admin.id };
      const data: IAdminAuthData = {
        id: admin.id,
        group_id: admin.group_id,
        token: this.jwtService.sign(payload),
      };
      return { statusCode: 200, data };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CAuthService.login',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async verify(dto: IAdminVerify): Promise<IResponse<void>> {
    try {
      const login = dto.email;
      const code = this.appService.randomString(6, 'digits');
      await this.dataSource.getRepository(CVerification).delete({ login });
      const verification = this.dataSource
        .getRepository(CVerification)
        .create({ login, code });
      await this.dataSource.getRepository(CVerification).save(verification);
      this.mailService.adminEmailVerification(dto.email, code);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CAuthService.verify',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async recover(dto: IAdminRecovery): Promise<IResponse<void>> {
    try {
      const admin = await this.dataSource
        .getRepository(CAdmin)
        .findOne({ where: { email: dto.email } });

      if (!admin) {
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

      admin.password = this.authService.buildHash(dto.password);
      await this.dataSource.getRepository(CAdmin).save(admin);
      return { statusCode: 200 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.admin/CAuthService.recover',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  /////////////////
  // utils
  /////////////////

  private safeData(x: CAdmin): CAdmin {
    delete x.password;
    return x;
  }

  protected async authorize(email: string, password: string): Promise<CAdmin> {
    const admin = await this.dataSource
      .getRepository(CAdmin)
      .createQueryBuilder('admin')
      .addSelect('admin.password')
      .where({ email })
      .getOne();

    if (
      admin?.active &&
      (await this.authService.compareHash(password, admin.password))
    ) {
      return admin;
    }

    return null;
  }
}
