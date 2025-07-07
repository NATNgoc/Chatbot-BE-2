import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { LoaderService } from './loader.service';

import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from './config/multer.config';
import { EnhanceDocumentService } from './enhance-document.service';
// import { LoadFileService } from './load-file.service';

@Module({
  imports: [ConfigModule, MulterModule.registerAsync(multerConfig)],
  providers: [IngestionService, LoaderService, EnhanceDocumentService],
  controllers: [IngestionController],
})
export class IngestionModule {}
