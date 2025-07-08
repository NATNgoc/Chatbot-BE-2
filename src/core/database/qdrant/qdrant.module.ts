import { OpenAIEmbedding } from '@llamaindex/openai';
import { QdrantVectorStore } from '@llamaindex/qdrant';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Settings } from 'llamaindex';
import { EnvKeyConstant } from 'src/common/constant';
import { PROVIDER_KEY } from 'src/common/constant/provider_key';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: PROVIDER_KEY.QDRANT,
      useFactory: (configService: ConfigService): QdrantVectorStore => {
        Settings.embedModel = new OpenAIEmbedding({
          apiKey: configService.get<string>(EnvKeyConstant.OPENAI_API_KEY),
          model: 'text-embedding-3-small',
        });
        return new QdrantVectorStore({
          url:
            configService.get<string>(EnvKeyConstant.QDRANT_URL) ||
            'http://localhost:6333',
          collectionName:
            configService.get<string>(EnvKeyConstant.QDRANT_COLLECTION) ||
            'documents',
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [PROVIDER_KEY.QDRANT],
})
export class QdrantModule {}
