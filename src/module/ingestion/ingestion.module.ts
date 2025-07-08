import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from './config/multer.config';
import { EnhanceDocumentService } from './enhance-document.service';
// import { LoadFileService } from './load-file.service';
import { EmbeddingService } from './embedding.service';
import { Settings } from 'llamaindex';
import { OpenAIEmbedding } from '@llamaindex/openai';
import { EnvKeyConstant } from 'src/common/constant';

@Module({
  imports: [ConfigModule, MulterModule.registerAsync(multerConfig)],
  providers: [IngestionService, EnhanceDocumentService, EmbeddingService],
  controllers: [IngestionController],
})
export class IngestionModule {
  constructor() {
    // Settings.embedModel = new HuggingFaceEmbedding({
    //   modelType: 'sentence-transformers/all-MiniLM-L6-v2',
    // });
  }
}
