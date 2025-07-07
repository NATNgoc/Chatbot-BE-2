import {
  Controller,
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ALLOWED_MIME_TYPES, REGREX_MIME_TYPE } from 'src/common/constant';
import { CustomFileTypeValidator } from 'src/common/interceptor/custom-file.interceptor';

@Controller('ingestion')
export class IngestionController {
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFile(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          new CustomFileTypeValidator({}),
        ],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    files: Array<Express.Multer.File>,
  ) {}
}
