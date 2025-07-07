import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { LoaderService } from './loader.service';
import { IngestionController } from './ingestion.controller';
import { MulterModule } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { EnvKeyConstant } from 'src/common/constant/env_key.constant';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination: join(
            process.cwd(),
            configService.get<string>(EnvKeyConstant.DATA_RAG_URL, '/data'),
          ),
          filename: (req, file, callback) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const fileExt = extname(file.originalname).toLowerCase();
            callback(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
          },
        }),
      }),
    }),
  ],
  providers: [IngestionService, LoaderService],
  controllers: [IngestionController],
})
export class IngestionModule {}
