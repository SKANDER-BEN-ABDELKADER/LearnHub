import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { DatabaseModule } from 'src/database/database.module';
import { LlamaApiModule } from '../llama-api/llama-api.module';

@Module({
  imports: [DatabaseModule, LlamaApiModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {} 