import { CanActivate, ExecutionContext, Injectable, ForbiddenException, } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const chapterId = Number(request.params.id);
    if (!chapterId) {
      throw new ForbiddenException('Chapter id is missing');
    }
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        course: {
          select: {
            teacherId: true
          }
        }
      },
    });
    if (!chapter) {
      throw new ForbiddenException('Chapter not found');
    }
    if (request.user.role === "ADMIN" || chapter?.course.teacherId === userId) {
      return true
    } else {
      throw new ForbiddenException('You cannot access this resource');
    }
  }
}
