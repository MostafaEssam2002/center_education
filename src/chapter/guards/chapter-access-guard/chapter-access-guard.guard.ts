import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ChapterAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // { userId, role, email }
    const chapterId = Number(request.params.id);

    if (!chapterId) {
      throw new ForbiddenException('Chapter id is missing');
    }

    // جلب الفصل مع الكورس بتاعه
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        course: { select: { teacherId: true, id: true } },
      },
    });

    if (!chapter) throw new ForbiddenException('Chapter not found');

    // Admin يقدر يشوف أي حاجة
    if (user.role === Role.ADMIN) return true;

    // Teacher: لو هو صاحب الكورس
    if (user.role === Role.TEACHER && chapter.course.teacherId === user.userId) return true;

    // Student: لو مسجل في الكورس
    if (user.role === Role.STUDENT) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          studentId_courseId_unique: { studentId: user.userId, courseId: chapter.course.id },
        },
      });

      if (!enrollment) throw new ForbiddenException('You are not enrolled in this course');
      return true;
    }

    throw new ForbiddenException('You cannot access this chapter');
  }
}
