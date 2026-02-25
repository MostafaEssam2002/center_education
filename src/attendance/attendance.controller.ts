import { Controller, Post, Get, Body, Param, UseGuards, ParseIntPipe, Req, } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role, AttendanceStatus } from '@prisma/client';
import { MarkBulkAttendanceDto } from './dto/mark-attendance.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreateSessionDto } from './dto/create-session.dto';
import { MarkSingleAttendanceDto } from './dto/mark-single-attendance.dto';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post('session')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new attendance session (Admin/Employee only)' })
  createSession(@Body() dto: CreateSessionDto) {
    return this.attendanceService.createSession(
      dto.courseId,
      new Date(dto.date),
      dto.startTime,
      dto.endTime,
      dto.roomId,
    );
  }

  @Post('mark')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark student attendance for a session' })
  markAttendance(@Body() dto: MarkSingleAttendanceDto) {
    return this.attendanceService.markAttendance(
      dto.sessionId,
      dto.studentId,
    );
  }

  @Post('mark-bulk/:sessionId')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark bulk attendance for a session' })
  @ApiParam({ name: 'sessionId', type: Number })
  markAttendanceBulk(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() body: MarkBulkAttendanceDto,
  ) {
    return this.attendanceService.markBulkAttendance(
      sessionId,
      body.students,
    );
  }

  @Get('session/:sessionId')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attendance list for a specific session' })
  @ApiParam({ name: 'sessionId', type: Number })
  getSessionAttendance(
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.attendanceService.getSessionAttendance(sessionId);
  }

  @Get('my/course/:courseId')
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current student attendance in a specific course' })
  @ApiParam({ name: 'courseId', type: Number })
  getMyAttendanceInCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: any,
  ) {
    const studentId = req.user.id;
    return this.attendanceService.getStudentAttendanceInCourse(
      studentId,
      courseId,
    );
  }

  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all sessions for a course' })
  @ApiParam({ name: 'courseId', type: Number })
  getCourseSessions(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.attendanceService.getCourseSessions(courseId);
  }
}