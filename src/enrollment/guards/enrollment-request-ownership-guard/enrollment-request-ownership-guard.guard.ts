import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class EnrollmentRequestOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // { userId, role, email }

    const courseId = request.params?.courseId ?? request.body?.courseId;
    const studentId = request.params?.studentId ?? request.body?.studentId;

    if (!courseId) {
      throw new ForbiddenException('Course id is missing');
    }

    // ADMIN يقدر يشوف أي request
    if (user.role === Role.ADMIN) return true;

    // TEACHER يقدر يشوف requests للكورسات اللي هو معلمها
    if (user.role === Role.TEACHER) {
      const course = await this.prisma.course.findUnique({
        where: { id: Number(courseId) },
        select: { teacherId: true },
      });
      if (!course) throw new ForbiddenException('Course not found');
      if (course.teacherId === user.id) return true;
      throw new ForbiddenException('You cannot access requests for this course');
    }

    // STUDENT يقدر يسحب أو يشوف request الخاص به فقط
    if (user.role === Role.STUDENT) {
      if (!studentId) {
        throw new ForbiddenException('Student id is required for this action');
      }
      if (user.id !== Number(studentId)) {
        throw new ForbiddenException('You cannot access this request');
      }
      return true;
    }

    throw new ForbiddenException('You cannot access this resource');
  }
}
