import { Injectable, CanActivate, ExecutionContext, HttpException, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CAdmin } from "src/model/entities/admin";
import { DataSource } from "typeorm";

@Injectable()
export class COwnerGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private dataSource: DataSource,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {        
        try {
            const token = context.switchToHttp().getRequest().headers["token"];        
            const data = this.jwtService.verify(token);      
            const id = data.id;
            const admin = await this.dataSource.getRepository(CAdmin).findOneBy({id});
            
            // admin must exists, be active and be in owners group
            if (!admin || !admin.active || admin.group_id !== 1) {
                throw new ForbiddenException();
            }
            
            return true;
        } catch (err) {
            console.log("COwnerGuard: unauthorized");
            throw new HttpException({statusCode: 403, error: "unauthorized"}, 200);
        }        
    }
}