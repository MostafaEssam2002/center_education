import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) { }
  async enroll(dto: CreateEnrollmentDto, user: { userId: number; role: string }) {
    // هنا ممكن تعمل check على صلاحيات user قبل التسجيل
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
        studentId_courseId: {
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
        studentId_courseId: {
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
        studentId_courseId_unique: { studentId, courseId },
      },
    });
  }

  async coursesForStudent(studentId: number, user: { userId: number; role: string }) {
    // هنا ممكن تعمل check على صلاحيات user قبل الجلب
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            teacher: true
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
