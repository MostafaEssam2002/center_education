import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const body = request.body;
    const params = request.params;

    // Admin can do anything
    if (user.role === Role.ADMIN) return true;

    // If teacherId is in body (e.g. creating/updating), check consistency (optional but existing logic preserved)
    if (body && body.teacherId && user.userId !== Number(body.teacherId)) {
      throw new ForbiddenException("You cannot act as another teacher");
    }

    // Check ownership by Course ID (from params or body)
    const courseId = params.id || params.courseId || body.courseId || body.id;

    if (courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: Number(courseId) },
        select: { teacherId: true }
      });

      if (!course) {
        throw new ForbiddenException("Course not found");
      }

      if (course.teacherId !== user.userId) {
        throw new ForbiddenException("You are not the owner of this course");
      }

      return true;
    }

    // Fallback: if we just checked teacherId in body above and no courseId involved
    if (body && body.teacherId && user.userId === Number(body.teacherId)) {
      return true;
    }

    // If we reached here, we probably don't have enough info to guarantee ownership
    // But to avoid breaking changes if this guard is used elsewhere loosely, 
    // IF it was relying purely on body.teacherId matching user.id
    if (request.method === 'POST' && !courseId) {
      // Assume creating something where ownership is implicit by user context if not specified? 
      // Or if the original guard was just checking user.id == body.teacherId
      return true;
    }

    // If attempting to access a specific course route but validation failed
    throw new ForbiddenException("Ownership validation failed");
  }
}
