import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IngestionModule } from './module/ingestion/ingestion.module';
import { QdrantModule } from './core/database/qdrant/qdrant.module';
import { ChatModule } from './module/chat/chat.module';

@Module({
  imports: [
    IngestionModule,
    MulterModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    QdrantModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
