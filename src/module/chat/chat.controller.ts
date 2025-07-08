import { Controller, Inject, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { IsNotEmpty } from 'class-validator';
import { PROVIDER_KEY } from 'src/common/constant/provider_key';
import { QdrantVectorStore } from '@llamaindex/qdrant';
import {
  Settings,
  VectorStoreQueryMode,
  VectorStoreQueryResult,
  MetadataMode,
} from 'llamaindex';

@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @Inject(PROVIDER_KEY.QDRANT)
    private readonly qdrantStore: QdrantVectorStore,
  ) {}

  @Post()
  async createChat(@Query('query') query: string) {
    // Tạo embedding từ query text
    const queryVector = await Settings.embedModel.getTextEmbedding(query);

    // Sử dụng queryVector để tìm kiếm trong vector store
    const result: VectorStoreQueryResult = await this.qdrantStore.query(
      {
        queryEmbedding: queryVector,
        similarityTopK: 5,
        mode: VectorStoreQueryMode.DEFAULT,
      },
      {
        includeMetadata: true, // Bao gồm metadata trong kết quả
      },
    );

    return {
      message: `Chat created successfully`,
      results: (result.nodes ?? []).map((node) => ({
        content: node.getContent(MetadataMode.ALL),
        // score: node.getScore(),
        metadata: node.metadata,
      })),
    };
  }
}
