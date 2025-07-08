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
import { OpenAI } from '@llamaindex/openai';

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

    const contexts = (result.nodes ?? [])
      .map((node) => node.getContent(MetadataMode.LLM))
      .filter(Boolean)
      .join('\n\n');

    const prompt = `
    Based on the following information, please answer the user's question accurately and in detail.
    Note: Please answer according to the language of the question.

    REFERENCE INFORMATION:
    ${contexts}

    QUESTION: ${query}

    ANSWER:`;

    const llmResponse = await Settings.llm.complete({
      prompt: prompt,
    });

    return {
      message: `Chat created successfully`,
      results: llmResponse,
    };
  }
}
