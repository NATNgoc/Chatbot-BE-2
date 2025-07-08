import { QdrantVectorStore } from '@llamaindex/qdrant';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeyConstant } from 'src/common/constant';
import { PROVIDER_KEY } from 'src/common/constant/provider_key';
import {
  LlamaIndexConfigModule,
  LlamaIndexConfigService,
} from 'src/core/llmaindexConfig/inital-cofig.module';

@Global()
@Module({
  imports: [LlamaIndexConfigModule],
  controllers: [],
  providers: [
    {
      provide: PROVIDER_KEY.QDRANT,
      useFactory: async (
        configService: ConfigService,
        _: LlamaIndexConfigService,
      ): Promise<QdrantVectorStore> => {
        return new QdrantVectorStore({
          url:
            configService.get<string>(EnvKeyConstant.QDRANT_URL) ||
            'http://localhost:6333',
          collectionName:
            configService.get<string>(EnvKeyConstant.QDRANT_COLLECTION) ||
            'documents',
        });
      },
      inject: [ConfigService, LlamaIndexConfigService],
    },
  ],
  exports: [PROVIDER_KEY.QDRANT],
})
export class QdrantModule {}
