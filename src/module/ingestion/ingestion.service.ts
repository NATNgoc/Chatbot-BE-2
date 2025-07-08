import { SimpleDirectoryReader } from '@llamaindex/readers/directory';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import * as fs from 'fs';
import {
  Document,
  IngestionPipeline,
  KeywordExtractor,
  Metadata,
  QuestionsAnsweredExtractor,
  SentenceSplitter,
  Settings,
  SummaryExtractor,
  TextSplitter,
  TitleExtractor,
} from 'llamaindex';
import * as path from 'path';
import { EnvKeyConstant } from 'src/common/constant';
import { EnhanceDocumentService } from './enhance-document.service';
import { OpenAI } from '@llamaindex/openai';
import { Gemini, gemini, GEMINI_MODEL } from '@llamaindex/google';
import { EmbeddingService } from './embedding.service';

@Injectable()
export class IngestionService {
  private readonly fullPath: string;
  private readonly logger = new Logger(IngestionService.name);
  private textSplitter: TextSplitter;
  private qaExtractor: QuestionsAnsweredExtractor;
  private sumaryExtractor: SummaryExtractor;
  private KeywordExtractor: KeywordExtractor;
  private titleExtractor: TitleExtractor;

  constructor(
    private readonly configService: ConfigService,
    private readonly enhanceDocumentService: EnhanceDocumentService,
    private readonly embeddingService: EmbeddingService,
  ) {
    const urlFolder =
      this.configService.get<string>(EnvKeyConstant.RAG_FOLDER_DATA_PATH) ||
      '/data';
    this.fullPath = path.join(process.cwd(), urlFolder);
    const llmTranformation = new OpenAI({
      model: 'gpt-3.5-turbo',
      temperature: 0.1,
      maxTokens: 2048,
    });
    this.intializeTransformer(llmTranformation);
    // const llmTranformation = gemini({
    //   model: GEMINI_MODEL.GEMINI_2_0_FLASH,
    //   temperature: 0.1,
    //   apiKey: this.configService.get<string>(EnvKeyConstant.GOOGLE_API_KEY),
    // });
  }

  private intializeTransformer(llmTranformation: OpenAI | Gemini) {
    this.qaExtractor = new QuestionsAnsweredExtractor({
      llm: llmTranformation,
      questions: 5,
    });

    this.textSplitter = new SentenceSplitter({
      chunkSize: 512,
      chunkOverlap: 50,
      separator: ' ',
      paragraphSeparator: '\n\n',
      secondaryChunkingRegex: '[.!?]',
    });
    this.sumaryExtractor = new SummaryExtractor({
      llm: llmTranformation,
      summaries: ['self'],
    });

    this.KeywordExtractor = new KeywordExtractor({
      llm: llmTranformation,
      keywords: 10,
    });

    this.titleExtractor = new TitleExtractor({
      llm: llmTranformation,
      nodes: 1,
    });
  }

  async ingestFiles() {
    const docs = await this.transferFileToDocumentObject();
    const ingestionPipeline = new IngestionPipeline({
      transformations: [
        this.textSplitter,
        this.qaExtractor,
        this.sumaryExtractor,
        this.KeywordExtractor,
        this.titleExtractor,
      ],
      documents: docs,
    });
    const nodes = await ingestionPipeline.run();
    await this.embeddingService.embedAndSave(nodes);
  }

  // Use the temporary directory to read files and convert them to Document objects for ingestion
  async transferFileToDocumentObject(): Promise<Document<Metadata>[]> {
    const docs = await new SimpleDirectoryReader().loadData(this.fullPath);

    const filteredDocs =
      await this.enhanceDocumentService.enhanceDocuments(docs);

    this.cleanupTempDirectory();
    return filteredDocs;
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
      this.removeEachFile(file);
    }
  }

  private removeEachFile(file: string) {
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
