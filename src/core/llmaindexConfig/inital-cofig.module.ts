import {
  Global,
  Injectable,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Settings } from 'llamaindex';
import { OpenAI } from '@llamaindex/openai';
import { OpenAIEmbedding } from '@llamaindex/openai';
import { EnvKeyConstant } from 'src/common/constant';

@Injectable()
export class LlamaIndexConfigService {
  private readonly logger = new Logger(LlamaIndexConfigService.name);

  constructor(private readonly configService: ConfigService) {
    this.initializeLlamaIndexSettings();
  }

  private initializeLlamaIndexSettings() {
    Settings.embedModel = new OpenAIEmbedding({
      apiKey: this.configService.get<string>(EnvKeyConstant.OPENAI_API_KEY),
      model: this.configService.get<string>(
        EnvKeyConstant.OPENAI_EMBEDDING_MODEL,
      ),
    });

    Settings.llm = new OpenAI({
      apiKey: this.configService.get<string>(EnvKeyConstant.OPENAI_API_KEY),
      model:
        this.configService.get<string>(EnvKeyConstant.OPENAI_MODEL) ||
        'gpt-3.5-turbo',
      temperature: 0.4,
      maxTokens: 2048,
    });
  }
}

@Global()
@Module({
  providers: [LlamaIndexConfigService],
  exports: [LlamaIndexConfigService],
})
export class LlamaIndexConfigModule {
  constructor() {}
}
