import { SimpleDirectoryReader } from '@llamaindex/readers/directory';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import * as fs from 'fs';
import { Document, Metadata, MetadataMode } from 'llamaindex';
import * as path from 'path';
import { EnvKeyConstant } from 'src/common/constant';
import { EnhanceDocumentService } from './enhance-document.service';

@Injectable()
export class IngestionService {
  private readonly fullPath: string;

  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly enhanceDocumentService: EnhanceDocumentService,
  ) {
    const urlFolder =
      this.configService.get<string>(EnvKeyConstant.RAG_FOLDER_DATA_PATH) ||
      '/data';
    this.fullPath = path.join(process.cwd(), urlFolder);
  }

  async ingestionFiles() {
    const docs = await this.loadFileToDocuments();
  }

  async loadFileToDocuments(): Promise<Document<Metadata>[]> {
    const docs = await new SimpleDirectoryReader().loadData(this.fullPath);
    console.log('docs', docs);
    const filteredDoc =
      await this.enhanceDocumentService.enhanceDocuments(docs);
    console.log('Loaded documents:');
    for (const doc of filteredDoc) {
      console.log('doc', doc.getContent(MetadataMode.LLM));
    }

    this.cleanupTempDirectory();
    return docs;
  }

  async isExistingFolder(): Promise<boolean> {
    return !fs.existsSync(this.fullPath);
  }

  private async cleanupTempDirectory(): Promise<void> {
    if (await this.isExistingFolder()) {
      this.logger.warn(`Directory does not exist: ${this.fullPath}`);
      return;
    }

    const files = fs.readdirSync(this.fullPath);
    for (const file of files) {
      this.insertEachFile(file);
    }
  }

  private insertEachFile(file: string) {
    const filePath = path.join(this.fullPath, file);

    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }

      this.logger.log(`Deleted: ${path.relative(process.cwd(), filePath)}`);
    } catch (statError) {
      this.logger.error(`Error processing ${filePath}:`, statError);
    }
  }
}
