import { Injectable } from "@nestjs/common";
import { IResponse } from "src/model/dto/response.interface";
import { IGetList } from "src/model/dto/getlist.interface";
import { CBackup } from "src/model/entities/backup";
import { DataSource, In } from "typeorm";
import { CSetting } from "src/model/entities/setting";
import { CAppService } from "src/common/services/app.service";
import { cfg } from "src/app.config";
import * as FS from "fs";
import { CErrorsService } from "src/common/services/errors.service";

@Injectable()
export class CBackupsService {
    constructor(
        private dataSource: DataSource,
        private appService: CAppService,
        private errorsService: CErrorsService,
    ) {}

    public async chunk(dto: IGetList): Promise<IResponse<CBackup[]>> {
        try {            
            const data = await this.dataSource.getRepository(CBackup).find({order: {[dto.sortBy]: dto.sortDir}, take: dto.q, skip: dto.from});
            const elementsQuantity = await this.dataSource.getRepository(CBackup).count();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CBackupsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.dataSource.getRepository(CBackup).findOneBy({id});
            await this.deleteUnbindedFile(x);
            await this.dataSource.getRepository(CBackup).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CBackupsService.delete", err);
            return {statusCode: 500, error};
        }        
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {     
            const xl = await this.dataSource.getRepository(CBackup).findBy({id: In(ids)});  
            await this.deleteUnbindedFile(xl);        
            await this.dataSource.getRepository(CBackup).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CBackupsService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(): Promise<IResponse<void>> {        
        try { 
            const unfinished = await this.dataSource.getRepository(CBackup).count({where: {ready: false}});

            if (unfinished) {
                return {statusCode: 503, error: "backups in progress"};
            }

            const filesBackup = this.dataSource.getRepository(CBackup).create({type: "files"});
            await this.dataSource.getRepository(CBackup).save(filesBackup);
            const dbBackup = this.dataSource.getRepository(CBackup).create({type: "db"});
            await this.dataSource.getRepository(CBackup).save(dbBackup);
            this.createFilesBackup(filesBackup);
            this.createDbBackup(dbBackup);
            return {statusCode: 201};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CBackupsService.create", err);
            return {statusCode: 500, error};
        }        
    }

    /////////////////
    // utils
    /////////////////
    
    public async createFilesBackup(backup: CBackup): Promise<void> {  
        try {
            const pathToZip = (await this.dataSource.getRepository(CSetting).findOne({where: {p: "path-zip"}}))?.v; 
            if (!pathToZip) throw "path-zip setting not found";
            const arcFilename = `${this.appService.mysqlDate(new Date())}-files-${backup.id}.zip`;
            const cmd = `cd .. && ${pathToZip} -r backup/${arcFilename} static`;
            await this.appService.spawn(cmd);
            backup.filename = arcFilename;
            backup.ready = true;
            await this.dataSource.getRepository(CBackup).save(backup);
        } catch (err) {
            await this.errorsService.log("api.admin/CBackupsService.createFilesBackup", err);
        }       
    }

    public async createDbBackup(backup: CBackup): Promise<void> {
        try {
            const pathToMysqldump = (await this.dataSource.getRepository(CSetting).findOne({where: {p: "path-mysqldump"}}))?.v; 
            const pathToGzip = (await this.dataSource.getRepository(CSetting).findOne({where: {p: "path-gzip"}}))?.v; 
            if ([pathToMysqldump, pathToGzip].includes(undefined)) throw "path-gzip or path-mysqldump setting not found";            
            const arcFilename = `${this.appService.mysqlDate(new Date())}-db-${backup.id}.gz`;
            const cmd = `${pathToMysqldump} -h ${cfg.dbHost} -P ${cfg.dbPort} -u ${cfg.dbLogin} -p${cfg.dbPassword} ${cfg.dbName} | ${pathToGzip} > ../backup/${arcFilename}`; 
            await this.appService.spawn(cmd);
            backup.filename = arcFilename;
            backup.ready = true;
            await this.dataSource.getRepository(CBackup).save(backup);
        } catch (err) {
            await this.errorsService.log("api.admin/CBackupsService.createDbBackup", err);
        }    
    }

    private deleteFile(path: string): Promise<void> {
        return new Promise((resolve, reject) => FS.existsSync(`../backup/${path}`) ? FS.rm(`../backup/${path}`, err => err ? reject(err) : resolve()) : resolve());        
    }

    public async deleteUnbindedFile(backup: CBackup): Promise<void>;
    public async deleteUnbindedFile(backups: CBackup[]): Promise<void>;
    public async deleteUnbindedFile(data: CBackup | CBackup[]): Promise<void> {
        if (Array.isArray(data)) {
            for (let backup of data) {
                await this.deleteFile(backup.filename);
            }
        } else {
            await this.deleteFile(data.filename);
        }
    }
}
