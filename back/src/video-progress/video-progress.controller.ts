import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VideoProgressService } from './video-progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('video-progress')
@UseGuards(JwtAuthGuard)
export class VideoProgressController {
  constructor(private readonly videoProgressService: VideoProgressService) {}

  @Post(':courseId')
  async updateProgress(
    @Request() req,
    @Param('courseId') courseId: string,
    @Body() body: { currentTime: number; duration: number },
  ) {
    return this.videoProgressService.updateProgress(
      req.user.id,
      parseInt(courseId),
      body.currentTime,
      body.duration,
    );
  }

  @Get(':courseId')
  async getProgress(@Request() req, @Param('courseId') courseId: string) {
    return this.videoProgressService.getProgress(
      req.user.id,
      parseInt(courseId),
    );
  }

  @Get()
  async getAllProgress(@Request() req) {
    return this.videoProgressService.getAllProgress(req.user.id);
  }

  @Get('stats/me')
  async getMyStats(@Request() req) {
    return this.videoProgressService.getStudentStats(req.user.id);
  }
}
