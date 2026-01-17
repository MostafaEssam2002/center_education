import { Controller, Post, Get, Body, Param, UseGuards, ParseIntPipe, Req, } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role, AttendanceStatus } from '@prisma/client';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post('session')
  @Roles(Role.ADMIN, Role.EMPLOYEE) // مين اللي يقدر ينشئ جلسة
  @UseGuards(JwtAuthGuard, RolesGuard)
  createSession(
    @Body()
    body: {
      courseId: number;
      date: string; // تاريخ الحصة
      startTime: string; // "08:00"
      endTime: string;   // "09:00"
      roomId: number;
    },
  ) {
    return this.attendanceService.createSession(
      body.courseId,
      new Date(body.date),
      body.startTime,
      body.endTime,
      body.roomId,
    );
  }

  /**
   * تسجيل حضور طالب في Session
   * ADMIN / EMPLOYEE / TEACHER
   */
  @Post('mark')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  markAttendance(
    @Body()
    body: {
      sessionId: number;
      studentId: number;
      status?: AttendanceStatus;
    },
  ) {
    return this.attendanceService.markAttendance(
      body.sessionId,
      body.studentId,
      // body.status,
    );
  }

  /**
   * تسجيل حضور مجموعة طلاب (مرة واحدة)
   */
  @Post('mark-bulk/:sessionId')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  markAttendanceBulk(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body()
    body: {
      students: {
        studentId: number;
        status?: AttendanceStatus;
      }[];
    },
  ) {
    return this.attendanceService.markBulkAttendance(
      sessionId,
      body.students, // هنا بعتنا الـ students للـ service مباشرة
    );
  }


  /**
   * عرض حضور Session معينة (كشف الحضور)
   */
  @Get('session/:sessionId')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getSessionAttendance(
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.attendanceService.getSessionAttendance(sessionId);
  }

  /**
   * الطالب يشوف حضوره في كورس
   */
  @Get('my/course/:courseId')
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getMyAttendanceInCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: any,
  ) {
    const studentId = req.user.userId;
    return this.attendanceService.getStudentAttendanceInCourse(
      studentId,
      courseId,
    );
  }

  /**
   * عرض كل الـ Sessions الخاصة بكورس معين
   */
  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getCourseSessions(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.attendanceService.getCourseSessions(courseId);
  }
}