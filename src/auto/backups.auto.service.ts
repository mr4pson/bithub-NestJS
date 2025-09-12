import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CBackupsService } from 'src/api.admin/backups/backups.service';
import { CErrorsService } from 'src/common/services/errors.service';
import { CBackup } from 'src/model/entities/backup';
import { DataSource } from 'typeorm';

// резеврные копии
@Injectable()
export class CBackupsAutoService {
  constructor(
    private dataSource: DataSource,
    private backupsService: CBackupsService,
    private errorsService: CErrorsService,
  ) {}

  @Cron('0 0 6 * * 1') // every monday 6:00 UTC
  private async create(): Promise<void> {
    try {
      const unfinished = await this.dataSource
        .getRepository(CBackup)
        .count({ where: { ready: false } });
      if (unfinished) return;
      const old = await this.dataSource.getRepository(CBackup).find();
      await this.backupsService.deleteUnbindedFile(old);
      await this.dataSource.getRepository(CBackup).remove(old);
      const filesBackup = this.dataSource
        .getRepository(CBackup)
        .create({ type: 'files' });
      await this.dataSource.getRepository(CBackup).save(filesBackup);
      const dbBackup = this.dataSource
        .getRepository(CBackup)
        .create({ type: 'db' });
      await this.dataSource.getRepository(CBackup).save(dbBackup);
      this.backupsService.createFilesBackup(filesBackup);
      this.backupsService.createDbBackup(dbBackup);
    } catch (err) {
      await this.errorsService.log('CBackupAutoService.create', err);
    }
  }
}
