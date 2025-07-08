import { HuggingFaceEmbedding } from '@llamaindex/huggingface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Settings,
  BaseNode,
  Document,
  VectorStoreIndex,
  TextNode,
  MetadataMode,
} from 'llamaindex';
import { QdrantVectorStore } from '@llamaindex/qdrant';
import { EnvKeyConstant } from 'src/common/constant';
import { OpenAIEmbedding } from '@llamaindex/openai';
import { PROVIDER_KEY } from 'src/common/constant/provider_key';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private vectorStore: QdrantVectorStore;

  constructor(
    private readonly configService: ConfigService,
    @Inject(PROVIDER_KEY.QDRANT) vectorStore: QdrantVectorStore,
  ) {
    // Settings.embedModel = new HuggingFaceEmbedding({
    //   modelType: 'sentence-transformers/all-MiniLM-L6-v2',
    // });
    this.vectorStore = vectorStore;
    this.initializeVectorStore();
  }

  private async initializeVectorStore() {
    this.vectorStore = new QdrantVectorStore({
      url:
        this.configService.get<string>(EnvKeyConstant.QDRANT_URL) ||
        'http://localhost:6333',
      collectionName:
        this.configService.get<string>(EnvKeyConstant.QDRANT_COLLECTION) ||
        'documents',
    });
  }

  async getEmbedding(text: string): Promise<number[]> {
    return await Settings.embedModel.getTextEmbedding(text);
  }

  async embedAndSave(nodes: BaseNode[]): Promise<void> {
    try {
      const batchSize = 50; // Giảm batch size để tránh memory issues

      for (let i = 0; i < nodes.length; i += batchSize) {
        const batch = nodes.slice(i, i + batchSize);

        for (const node of batch) {
          if (!node.embedding) {
            try {
              const content = node.getContent(MetadataMode.ALL);
              if (content && content.trim().length > 0) {
                const embedding = await this.getEmbedding(content);
                node.embedding = embedding;
                this.logger.debug(`Generated embedding for node ${node.id_}`);
              }
            } catch (embeddingError) {
              this.logger.warn(
                `Failed to generate embedding for node ${node.id_}:`,
                embeddingError,
              );
              continue;
            }
          }
        }

        const validNodes = batch.filter((node) => node.embedding);

        if (validNodes.length > 0) {
          await this.vectorStore.add(validNodes);
          this.logger.log(
            `Saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(nodes.length / batchSize)} (${validNodes.length}/${batch.length} nodes) to vector store`,
          );
        }
      }

      this.logger.log(
        `Successfully processed ${nodes.length} nodes for vector store`,
      );
    } catch (error) {
      this.logger.error('Failed to save nodes to vector store:', error);
      throw error;
    }
  }

  //   // 5. Tìm kiếm similarity search
  //   async similaritySearch(query: string, topK: number = 5): Promise<BaseNode[]> {
  //     try {
  //       const queryEmbedding = await this.getEmbedding(query);
  //       const results = await this.vectorStore.query({
  //         queryEmbedding,
  //         similarityTopK: topK,
  //       });

  //       return results.nodes;
  //     } catch (error) {
  //       this.logger.error('Failed to perform similarity search:', error);
  //       throw error;
  //     }
  //   }

  //   async clearVectorStore(): Promise<void> {
  //     try {
  //       await this.vectorStore.delete();
  //       this.logger.log('Vector store cleared successfully');
  //     } catch (error) {
  //       this.logger.error('Failed to clear vector store:', error);
  //       throw error;
  //     }
  //   }

  //   // 7. Kiểm tra kết nối Qdrant
  //   async healthCheck(): Promise<boolean> {
  //     try {
  //       // Implement health check logic based on Qdrant client
  //       return true;
  //     } catch (error) {
  //       this.logger.error('Qdrant health check failed:', error);
  //       return false;
  //     }
  //   }

  //   // 8. Lấy thống kê collection
  //   async getCollectionInfo(): Promise<any> {
  //     try {
  //       // Implement collection info retrieval
  //       return await this.vectorStore.client?.getCollectionInfo();
  //     } catch (error) {
  //       this.logger.error('Failed to get collection info:', error);
  //       throw error;
  //     }
  //   }
}
