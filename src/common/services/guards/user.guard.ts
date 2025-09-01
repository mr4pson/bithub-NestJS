import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CUser } from 'src/model/entities/user';
import { DataSource } from 'typeorm';

@Injectable()
export class CUserGuard implements CanActivate {
  constructor(private jwtService: JwtService, private dataSource: DataSource) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const token = context.switchToHttp().getRequest().headers['token'];
      const data = this.jwtService.verify(token);
      const id = data.id;
      const user = await this.dataSource.getRepository(CUser).findOneBy({ id });

      // user must exists and be active
      if (!user || !user.active) {
        throw new ForbiddenException();
      }

      return true;
    } catch (err) {
      console.log(err);
      throw new HttpException({ statusCode: 403, error: 'unauthorized' }, 200);
    }
  }
}
