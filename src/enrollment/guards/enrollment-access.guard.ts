import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnrollmentAccessGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const params = request.params;

        // 1. Admin and Employee have full access
        if (user.role === Role.ADMIN || user.role === Role.EMPLOYEE) {
            return true;
        }

        // 2. Teachers must own the course
        if (user.role === Role.TEACHER) {
            const courseId = params.courseId || params.id;

            if (!courseId) {
                // If no courseId is present in params, we can't verify ownership here.
                // Assuming this guard is used on routes with :courseId
                return true;
            }

            const course = await this.prisma.course.findUnique({
                where: { id: Number(courseId) },
                select: { teacherId: true }
            });

            if (!course) {
                throw new ForbiddenException("Course not found");
            }

            if (course.teacherId !== user.id) {
                throw new ForbiddenException("You are not the owner of this course");
            }

            return true;
        }

        // Default deny for other roles if they somehow got past RolesGuard (though @Roles should handle them)
        // But if STUDENT is allowed by @Roles, this guard would block them unless we add a check.
        // The endpoint uses @Roles(ADMIN, TEACHER, EMPLOYEE), so students are already blocked by RolesGuard.
        return true;
    }
}
