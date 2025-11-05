import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class VideoProgressService {
  constructor(private readonly database: DatabaseService) {}

  async updateProgress(
    studentId: number,
    courseId: number,
    currentTime: number,
    duration: number,
  ) {
    const completed = currentTime >= duration * 0.95; // 95% watched = completed

    return this.database.videoProgress.upsert({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      update: {
        currentTime,
        duration,
        completed,
        lastWatchedAt: new Date(),
      },
      create: {
        studentId,
        courseId,
        currentTime,
        duration,
        completed,
        lastWatchedAt: new Date(),
      },
    });
  }

  async getProgress(studentId: number, courseId: number) {
    return this.database.videoProgress.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });
  }

  async getAllProgress(studentId: number) {
    return this.database.videoProgress.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastWatchedAt: 'desc',
      },
    });
  }

  async getStudentStats(studentId: number) {
    const allProgress = await this.database.videoProgress.findMany({
      where: { studentId },
      include: {
        course: true,
      },
    });

    const totalCourses = allProgress.length;
    const completedCourses = allProgress.filter((p) => p.completed).length;
    const totalTimeWatched = allProgress.reduce(
      (sum, p) => sum + p.currentTime,
      0,
    );
    const averageProgress =
      totalCourses > 0
        ? allProgress.reduce((sum, p) => {
            const progress =
              p.duration > 0 ? (p.currentTime / p.duration) * 100 : 0;
            return sum + progress;
          }, 0) / totalCourses
        : 0;

    return {
      totalCourses,
      completedCourses,
      totalTimeWatched: Math.floor(totalTimeWatched), // in seconds
      totalHoursWatched: (totalTimeWatched / 3600).toFixed(1), // in hours
      averageProgress: Math.round(averageProgress),
      inProgressCourses: totalCourses - completedCourses,
    };
  }
}
