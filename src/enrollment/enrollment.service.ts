import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) { }
  async enroll(dto: CreateEnrollmentDto, user: { id: number; role: string }) {
    // هنا ممكن تعمل check على صلاحيات user قبل التسجيل
    // Check if already enrolled
    console.log("hello from enrollment service ")
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

    // --- Capacity Check (Bottleneck Logic) ---
    const courseSchedules = await this.prisma.courseSchedule.findMany({
      where: { courseId: dto.courseId },
      include: { room: true },
    });

    // Filter valid offline rooms with capacity
    const offlineRooms = courseSchedules
      .map(s => s.room)
      .filter(r => r.type === 'OFFLINE' && r.capacity && r.capacity > 0);

    if (offlineRooms.length > 0) {
      // Find the minimum capacity (The Bottleneck)
      const minCapacity = Math.min(...offlineRooms.map(r => r.capacity as number));

      const currentEnrollments = await this.prisma.enrollment.count({
        where: { courseId: dto.courseId },
      });

      if (currentEnrollments >= minCapacity) {
        throw new ConflictException(
          `لا يمكن قبول الطالب. الكورس ممتلئ بناءً على سعة أصغر قاعة (${minCapacity} طالب).`
        );
      }
    }
    // ------------------------------------------

    // التحقق من وجود طلب انضمام
    const enrollmentRequest = await this.prisma.enrollmentRequest.findUnique({
      where: {
        unique_enrollment_request_student_course: {
          studentId: dto.studentId,
          courseId: dto.courseId,
        },
      },
    });

    // إذا كان هناك طلب، نغير حالته إلى WAIT_FOR_PAY
    if (enrollmentRequest) {
      const updatedRequest = await this.prisma.enrollmentRequest.update({
        where: {
          unique_enrollment_request_student_course: {
            studentId: dto.studentId,
            courseId: dto.courseId,
          },
        },
        data: {
          status: 'WAIT_FOR_PAY',
        },
      });
      return {
        message: 'Request approved. Waiting for payment.',
        request: updatedRequest
      };
    }

    // إذا لم يكن هناك طلب، نسجل الطالب مباشرة (للحالات الخاصة)
    const enrollment = await this.prisma.enrollment.create({
      data: {
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

  async unenroll(studentId: number, courseId: number, user: { id: number; role: string }) {
    // هنا ممكن تعمل check على صلاحيات user قبل الحذف
    return this.prisma.enrollment.delete({
      where: {
        unique_enrollment_student_course: { studentId, courseId },
      },
    });
  }

  async coursesForStudent(studentId: number, user: { id: number; role: string }) {
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
    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        unique_enrollment_student_course: { studentId, courseId },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('You are already enrolled in this course');
    }

    // Check if request already exists
    const existingRequest = await this.prisma.enrollmentRequest.findUnique({
      where: {
        unique_enrollment_request_student_course: { studentId, courseId },
      },
    });

    if (existingRequest) {
      throw new ConflictException('Enrollment request already sent');
    }

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

  async getMyRequests(studentId: number) {
    return this.prisma.enrollmentRequest.findMany({
      where: { studentId },
      include: {
        course: {
          include: { teacher: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =======================
  // تأكيد الدفع - الطالب يدفع بعد موافقة المدرس
  // =======================
  async confirmPayment(courseId: number, studentId: number) {
    // التحقق من وجود طلب بحالة WAIT_FOR_PAY
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

    if (request.status !== 'WAIT_FOR_PAY') {
      throw new ConflictException(
        `Payment not required. Current status: ${request.status}`,
      );
    }

    // التحقق من عدم وجود enrollment مسبق
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        unique_enrollment_student_course: {
          studentId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      // إذا كان مسجل بالفعل، نمسح الطلب ونرجع
      await this.prisma.enrollmentRequest.delete({
        where: {
          unique_enrollment_request_student_course: {
            studentId,
            courseId,
          },
        },
      });
      return {
        message: 'Already enrolled. Request deleted.',
        enrollment: existingEnrollment
      };
    }

    // --- Capacity Check (Bottleneck Logic) ---
    const courseSchedules = await this.prisma.courseSchedule.findMany({
      where: { courseId },
      include: { room: true },
    });

    const offlineRooms = courseSchedules
      .map(s => s.room)
      .filter(r => r.type === 'OFFLINE' && r.capacity && r.capacity > 0);

    if (offlineRooms.length > 0) {
      const minCapacity = Math.min(...offlineRooms.map(r => r.capacity as number));
      const currentEnrollments = await this.prisma.enrollment.count({
        where: { courseId },
      });

      if (currentEnrollments >= minCapacity) {
        throw new ConflictException(
          `لا يمكن قبول الطالب. الكورس ممتلئ بناءً على سعة أصغر قاعة (${minCapacity} طالب).`
        );
      }
    }
    // ------------------------------------------

    // إنشاء enrollment و مسح الطلب في transaction واحد
    const result = await this.prisma.$transaction(async (prisma) => {
      // إنشاء enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId,
          courseId,
        },
      });

      // مسح الطلب بعد الدفع
      await prisma.enrollmentRequest.delete({
        where: {
          unique_enrollment_request_student_course: {
            studentId,
            courseId,
          },
        },
      });

      return enrollment;
    });

    return {
      message: 'Payment confirmed. Student enrolled successfully.',
      enrollment: result,
    };
  }
}
