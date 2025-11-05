import { Module } from '@nestjs/common';
import { VideoAnalysisService } from './video-analysis.service';
import { LlamaApiModule } from '../llama-api/llama-api.module';

@Module({
  imports: [LlamaApiModule],
  providers: [VideoAnalysisService],
  exports: [VideoAnalysisService],
})
export class VideoAnalysisModule {} 