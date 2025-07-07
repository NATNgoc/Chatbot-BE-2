import { BadRequestException, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModuleAsyncOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ALLOWED_MIME_TYPES, EnvKeyConstant } from 'src/common/constant';

export const multerConfig: MulterModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    storage: diskStorage({
      destination: join(
        process.cwd(),
        configService.get<string>(EnvKeyConstant.RAG_FOLDER_DATA_PATH) ||
          '/data',
      ),
      filename: (_, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const fileExt = extname(file.originalname).toLowerCase();
        callback(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
      },
    }),
    fileFilter: (_, file, callback) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return callback(
          new BadRequestException(
            `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
          ),
          false,
        );
      }
      callback(null, true);
    },
    limits: {
      fileSize: (() => {
        const configuredSize = configService.get<string>(
          EnvKeyConstant.RAG_LIMIT_FILE_SIZE,
          (20 * 1024 * 1024).toString(),
        );
        const parsedSize = parseInt(configuredSize, 10);
        return parsedSize ?? 20 * 1024 * 1024;
      })(),
      files: (() => {
        const configuredSize = configService.get(
          EnvKeyConstant.RAG_LIMIT_FILE_COUNT,
        );
        Logger.warn(
          `'files' limit is deprecated in Multer, using 'fileSize' instead. ${typeof configuredSize} is set to ${configuredSize}.`,
        );
        return parseInt(configuredSize) ?? 10;
      })(),
    },
  }),
};
