import { Module } from '@nestjs/common';
import { LlamaApiService } from './llama-api.service';

@Module({
  providers: [LlamaApiService],
  exports: [LlamaApiService],
})
export class LlamaApiModule {}
