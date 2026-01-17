import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseScheduleDto } from './dto/create-course-schedule.dto';
import { UpdateCourseScheduleDto } from './dto/update-course-schedule.dto';

@Injectable()
export class CourseScheduleService {
  constructor(private prisma: PrismaService) { }
  // ===============================
  // Helpers
  // ===============================
  private validateTime(start: string, end: string) {
    if (start >= end) {
      throw new BadRequestException(
        'End time must be after start time',
      );
    }
  }
  private async checkOverlap(params: { day: any; startTime: string; endTime: string; roomId: number; excludeId?: number; }) {
    const { day, startTime, endTime, roomId, excludeId } = params;
    const conflicts = await this.prisma.courseSchedule.findMany({
      where: {
        day,
        roomId,
        ...(excludeId && { id: { not: excludeId } }),
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });

    if (conflicts.length > 0) {
      throw new BadRequestException(
        'Schedule conflict detected for this day and time in the selected room',
      );
    }
  }
  // ===============================
  // CREATE schedule
  // ===============================
  async create(dto: CreateCourseScheduleDto) {
    this.validateTime(dto.startTime, dto.endTime);
    // التأكد إن الكورس موجود
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // التأكد إن الغرفة موجودة
    // const room = await this.prisma.room.findUnique({
    //   where: { id: dto.roomId },
    // });
    const room = await this.prisma.room.findFirst({
      where: { id: dto.roomId, isActive: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // منع التعارض في نفس اليوم + نفس القاعة
    await this.checkOverlap({
      day: dto.day,
      startTime: dto.startTime,
      endTime: dto.endTime,
      roomId: dto.roomId,
    });
    return this.prisma.courseSchedule.create({
      data: dto,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        room: true,
      },
    });
  }

  // ===============================
  // UPDATE schedule
  // ===============================
  async update(id: number, dto: UpdateCourseScheduleDto) {
    const schedule = await this.prisma.courseSchedule.findUnique({
      where: { id },
    });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    const startTime = dto.startTime ?? schedule.startTime;
    const endTime = dto.endTime ?? schedule.endTime;
    const day = dto.day ?? schedule.day;
    const roomId = dto.roomId ?? schedule.roomId;

    this.validateTime(startTime, endTime);

    // Check if room exists if it's being updated
    if (dto.roomId) {
      // const room = await this.prisma.room.findUnique({
      //   where: { id: dto.roomId },
      // });
      const room = await this.prisma.room.findFirst({
        where: { id: dto.roomId, isActive: true },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }
    }

    await this.checkOverlap({
      day,
      startTime,
      endTime,
      roomId,
      excludeId: id,
    });
    return this.prisma.courseSchedule.update({
      where: { id },
      data: dto,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        room: true,
      },
    });
  }
  // ===============================
  // DELETE schedule
  // ===============================
  async remove(id: number) {
    const schedule = await this.prisma.courseSchedule.findUnique({
      where: { id },
    });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return this.prisma.courseSchedule.delete({
      where: { id },
    });
  }
  // ===============================
  // GET weekly schedule
  // ===============================
  async findWeeklySchedule() {
    return this.prisma.courseSchedule.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
  }

  // ===============================
  // GET student schedule
  // ===============================
  async findStudentSchedule(studentId: number) {
    return this.prisma.courseSchedule.findMany({
      where: {
        course: {
          enrollments: {
            some: {
              studentId: studentId,
            },
          },
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
  }
}
