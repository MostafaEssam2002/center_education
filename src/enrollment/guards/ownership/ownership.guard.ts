import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class EnrollmentOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // { userId, role, email }
    const courseId = Number(request.params.id);

    if (!courseId) {
      throw new ForbiddenException('Course id is missing');
    }

    // ADMIN يقدر يشوف أي كورس
    if (user.role === Role.ADMIN) return true;

    if (user.role === Role.TEACHER) {
      // مدرس الكورس فقط
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        select: { teacherId: true },
      });

      if (!course) throw new ForbiddenException('Course not found');
      if (course.teacherId === user.userId) return true;
      throw new ForbiddenException('You cannot access this course');
    }

    if (user.role === Role.STUDENT) {
      // الطالب مسجل في الكورس
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { unique_enrollment_student_course: { studentId: user.studentId, courseId } },
      });
      if (!enrollment) throw new ForbiddenException('You are not enrolled in this course');
      return true;
    }

    throw new ForbiddenException('You cannot access this course');
  }
}
