import { Module } from '@nestjs/common';
import { CSettingsModule } from './settings/settings.module';
import { CLangsModule } from './langs/langs.module';
import { CFilesModule } from './files/files.module';
import { CWordsModule } from './words/words.module';
import { CAwardsModule } from './awards/awards.module';
import { CArticlesModule } from './articles/articles.module';

@Module({
  imports: [
    CSettingsModule,
    CLangsModule,
    CFilesModule,
    CWordsModule,
    CAwardsModule,
    CArticlesModule,
  ],
})
export class CApiLandingModule {}
