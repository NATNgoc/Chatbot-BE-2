import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EnhanceDocumentService } from './enhance-document.service';
import { IngestionService } from './ingestion.service';

@Controller('ingestion')
export class IngestionController {
  constructor(
    private readonly ingestionService: IngestionService,
    private readonly enhanceDocumentService: EnhanceDocumentService,
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    const docs = await this.ingestionService.ingestionFiles();
    return {
      message: 'Files uploaded successfully',
      filesCount: files.length,
    };
  }
}
