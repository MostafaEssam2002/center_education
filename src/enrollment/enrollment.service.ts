import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) { }
  async enroll(dto: CreateEnrollmentDto, user: { userId: number; role: string }) {
    // هنا ممكن تعمل check على صلاحيات user قبل التسجيل
    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        unique_enrollment_student_course: {
          studentId: dto.studentId,
          courseId: dto.courseId,
        },
      },
    });

    if (existingEnrollment) {
      // Already enrolled, just remove the request if any and return
      await this.prisma.enrollmentRequest.deleteMany({
        where: {
          studentId: dto.studentId,
          courseId: dto.courseId,
        },
      });
      return existingEnrollment;
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        studentId: dto.studentId,
        courseId: dto.courseId,
      },
    });

    // مسح طلب الالتحاق بعد القبول
    await this.prisma.enrollmentRequest.deleteMany({
      where: {
        studentId: dto.studentId,
        courseId: dto.courseId,
      },
    });

    return enrollment;
  }

  async withdrawRequest(courseId: number, studentId: number) {
    // التأكد إن الطلب موجود أصلاً
    const request = await this.prisma.enrollmentRequest.findUnique({
      where: {
        unique_enrollment_request_student_course: {
          studentId,
          courseId,
        },
      },
    });

    if (!request) {
      throw new NotFoundException(
        `No enrollment request found for student ${studentId} in course ${courseId}`,
      );
    }

    // حذف الطلب
    await this.prisma.enrollmentRequest.delete({
      where: {
        unique_enrollment_request_student_course: {
          studentId,
          courseId,
        },
      },
    });

    return { message: 'Enrollment request withdrawn successfully.' };
  }

  async unenroll(studentId: number, courseId: number, user: { userId: number; role: string }) {
    // هنا ممكن تعمل check على صلاحيات user قبل الحذف
    return this.prisma.enrollment.delete({
      where: {
        unique_enrollment_student_course: { studentId, courseId },
      },
    });
  }

  async coursesForStudent(studentId: number, user: { userId: number; role: string }) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            teacher: true,
            Quiz: {
              where: { isPublished: true },
              include: {
                questions: true,
                attempts: {
                  where: { studentId },
                },
              },
            },
          }
        }
      },
    });
  }

  async studentsInCourse(courseId: number) {
    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: true,
      },
    });
  }
  async requestEnrollment(courseId: number, studentId: number) {
    return this.prisma.enrollmentRequest.create({
      data: {
        studentId,
        courseId,
      },
    });
  }
  async showRequestEnrollment(courseId: number, teacherId: number) {
    return this.prisma.enrollmentRequest.findMany({
      where: { courseId },
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
