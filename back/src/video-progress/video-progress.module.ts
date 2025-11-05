import { Module } from '@nestjs/common';
import { VideoProgressController } from './video-progress.controller';
import { VideoProgressService } from './video-progress.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [VideoProgressController],
  providers: [VideoProgressService],
  exports: [VideoProgressService],
})
export class VideoProgressModule {}
