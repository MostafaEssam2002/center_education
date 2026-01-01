import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChapterProgressService {
  constructor(private prisma: PrismaService) { }
  /**
   * تحديث progress فيديو الشابتر
   * - لا يسمح بتقليل progress
   * - progress من 0 إلى 100
   */
  async updateVideoProgress(studentId: number, chapterId: number, newProgress: number,) {
    // حماية القيمة
    newProgress = Math.min(100, Math.max(0, newProgress));
    const existing = await this.prisma.chapterProgress.findUnique({
      where: {
        unique_chapter_progress_student_chapter: { studentId, chapterId },
      },
    });
    // منع الرجوع للخلف
    if (existing && newProgress <= existing.progress) {
      return existing;
    }
    return this.prisma.chapterProgress.upsert({
      where: {
        unique_chapter_progress_student_chapter: { studentId, chapterId },
      },
      update: {
        progress: newProgress,
      },
      create: {
        studentId,
        chapterId,
        progress: newProgress,
      },
    });
  }

  /**
   * جلب progress شابتر معين
   */
  async getChapterProgress(studentId: number, chapterId: number) {
    return this.prisma.chapterProgress.findUnique({
      where: {
        unique_chapter_progress_student_chapter: { studentId, chapterId },
      },
    });
  }

  /**
   * حساب progress الكورس بالكامل كنسبة مئوية
   * (متوسط progress جميع الشابترز)
   */
  async getCourseProgress(studentId: number, courseId: number) {
    const chapters = await this.prisma.chapter.findMany({
      where: { courseId },
      select: { id: true },
    });

    const totalChapters = chapters.length;
    if (totalChapters === 0) return 0;
    const progresses = await this.prisma.chapterProgress.findMany({
      where: {
        studentId,
        chapterId: { in: chapters.map(c => c.id) },
      },
    });
    const totalProgress = chapters.reduce((sum, chapter) => {
      const chapterProgress =
        progresses.find(p => p.chapterId === chapter.id)?.progress ?? 0;
      return sum + chapterProgress;
    }, 0);
    const result = totalProgress / totalChapters;
    return result;
  }
}
