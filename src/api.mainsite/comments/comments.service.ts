import { Injectable } from '@nestjs/common';
import { CErrorsService } from 'src/common/services/errors.service';
import { IGetList } from 'src/model/dto/getlist.interface';
import { IResponse } from 'src/model/dto/response.interface';
import { DataSource } from 'typeorm';
import { IComment } from './dto/comment.interface';
import { CComment } from 'src/model/entities/comment';
import { CAppService } from 'src/common/services/app.service';
import { ICommentCreate } from './dto/comment.create.interface';
import { CCaptchaService } from 'src/common/services/captcha.service';
import { CAdmin } from 'src/model/entities/admin';
import { CMailService } from 'src/common/services/mailable/mail.service';

@Injectable()
export class CCommentsService {
  constructor(
    protected dataSource: DataSource,
    protected errorsService: CErrorsService,
    protected appService: CAppService,
    protected captchaService: CCaptchaService,
    protected mailService: CMailService,
  ) {}

  public async chunk(
    dto: IGetList,
    tz: number,
  ): Promise<IResponse<IComment[]>> {
    try {
      const filter = { active: true, guide_id: dto.filter.guide_id };
      const comments = await this.dataSource.getRepository(CComment).find({
        where: filter,
        take: dto.q,
        skip: dto.from,
        order: { [dto.sortBy]: dto.sortDir },
        relations: ['user'],
      });
      const data = comments.map((c) => this.buildComment(c, tz));
      const elementsQuantity = await this.dataSource
        .getRepository(CComment)
        .count({ where: filter });
      const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
      return { statusCode: 200, data, elementsQuantity, pagesQuantity };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CCommentsService.chunk',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  public async create(
    user_id: number,
    dto: ICommentCreate,
  ): Promise<IResponse<void>> {
    try {
      const captchared = await this.captchaService.verify(dto.captchaToken);
      if (!captchared)
        return { statusCode: 400, error: 'captcha verification failed' };
      const comment = this.buildCreation(user_id, dto);
      const created = await this.dataSource
        .getRepository(CComment)
        .save(comment);
      this.notifyOnCreate(created);
      return { statusCode: 201 };
    } catch (err) {
      const error = await this.errorsService.log(
        'api.mainsite/CCommentsService.create',
        err,
      );
      return { statusCode: 500, error };
    }
  }

  ///////////////
  // utils
  ///////////////

  private buildComment(comment: CComment, tz: number): IComment {
    return {
      id: comment.id,
      is_admin: comment.is_admin,
      userName: comment.is_admin ? null : comment.user.name,
      userImg: comment.is_admin ? null : comment.user.img,
      userLetter: comment.is_admin
        ? 'A'
        : comment.user.name?.substring(0, 1).toUpperCase(),
      content: comment.content,
      created_at: this.appService.humanDate(
        this.appService.utcToLocal(comment.created_at, tz),
        true,
      ),
    };
  }

  private buildCreation(
    user_id: number,
    dto: ICommentCreate,
  ): Partial<CComment> {
    return {
      is_admin: false,
      user_id,
      guide_id: dto.guide_id,
      content: String(dto.content)
        .trim()
        //.replace(/<\/?[^>]+(>|$)/g, "") // remove tags - пока пропустим
        .substring(0, 1000)
        .replace(/\[r\]/g, '<strong>')
        .replace(/\[\/r\]/g, '</strong>')
        .replace(/\n/g, '<br>'),
      active: false,
    };
  }

  private async notifyOnCreate(comment: CComment): Promise<void> {
    try {
      const admins = await this.dataSource
        .getRepository(CAdmin)
        .find({ where: { active: true, hidden: false } });

      for (const admin of admins) {
        await this.mailService.adminComment(admin.email, comment);
      }
    } catch (err) {
      await this.errorsService.log(
        'api.mainsite/CCommentsService.notifyOnCreate',
        err,
      );
    }
  }
}
