import { Controller, Get, Post, Body, Delete, Param, Req, UseGuards, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { CreateEnrollmentRequestDto } from './dto/CreateEnrollmentRequest.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from '@prisma/client';
import { OwnershipGuard as OwnershipGuardForCourse } from '../course/guards/ownership/ownership.guard';
import { EnrollmentOwnershipGuard } from './guards/ownership/ownership.guard';
import { EnrollmentRequestOwnershipGuard } from './guards/enrollment-request-ownership-guard/enrollment-request-ownership-guard.guard';
import { EnrollmentAccessGuard } from './guards/enrollment-access.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Enrollment')
@ApiBearerAuth()
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) { }

  // =======================
  // الطالب يرسل طلب الاشتراك
  // =======================
  @Post('request')
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Student sends an enrollment request to a course-->يرسل الطالب طلب تسجيل في دورة تدريبية' })
  @ApiBody({ type: CreateEnrollmentRequestDto })
  @ApiResponse({ status: 201, description: 'Enrollment request created successfully.' })
  requestEnrollment(@Body() dto: CreateEnrollmentRequestDto, @Req() request: any) {
    const user = request.user;
    return this.enrollmentService.requestEnrollment(dto.courseId, user.id);
  }

  // =======================
  // عرض كل طلبات الانضمام لكورس للمعلم/الادمن
  // =======================
  @Get('requests/:courseId')
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, EnrollmentRequestOwnershipGuard)
  @ApiOperation({ summary: 'Teacher/Admin views all enrollment requests for a course-->يقوم المعلم/المسؤول بمراجعة جميع طلبات التسجيل في الدورة التدريبية' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiResponse({ status: 200, description: 'List of enrollment requests', type: [CreateEnrollmentRequestDto] })
  showRequestEnrollment(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() request: any,
  ) {
    const user = request.user;
    return this.enrollmentService.showRequestEnrollment(courseId, user.id);
  }

  // =======================
  // الطالب يسحب طلبه
  // =======================
  @Delete('request/:courseId')
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Student withdraws their enrollment request-->سحب الطالب طلب التسجيل الخاص به' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiResponse({ status: 200, description: 'Enrollment request withdrawn successfully.' })
  withdrawRequest(@Param('courseId', ParseIntPipe) courseId: number, @Req() request: any) {
    const studentId = request.user.id;
    return this.enrollmentService.withdrawRequest(courseId, studentId);
  }

  // =======================
  // المعلم/الادمن يرفض طلب الانضمام
  // =======================
  @Delete('request/:courseId/:studentId')
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, EnrollmentRequestOwnershipGuard)
  @ApiOperation({ summary: 'Teacher/Admin rejects an enrollment request-->المعلم/الادمن يرفض طلب الانضمام' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiParam({ name: 'studentId', type: Number })
  @ApiResponse({ status: 200, description: 'Enrollment request rejected successfully.' })
  rejectRequest(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('studentId', ParseIntPipe) studentId: number
  ) {
    return this.enrollmentService.withdrawRequest(courseId, studentId);
  }

  // =======================
  // تسجيل طالب في كورس (Admin/Teacher)
  // =======================
  @Post()
  @Roles(Role.ADMIN, Role.TEACHER,Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuardForCourse)
  @ApiOperation({ summary: 'Admin/Teacher enrolls a student in a course-->يقوم المسؤول/المعلم بتسجيل طالب في دورة تدريبية' })
  @ApiBody({ type: CreateEnrollmentDto })
  @ApiResponse({ status: 201, description: 'Student enrolled successfully.' })
  enroll(@Body() dto: CreateEnrollmentDto, @Req() request: any) {
    const user = request.user;
    return this.enrollmentService.enroll(dto, user);
  }

  // =======================
  // عرض كل الطلاب في كورس معين
  // =======================
  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.EMPLOYEE)
  @UseGuards(JwtAuthGuard, RolesGuard, EnrollmentAccessGuard)
  @ApiOperation({ summary: 'Admin/Teacher views all students in a course-->يقوم المسؤول/المعلم بعرض جميع الطلاب في الدورة' })
  @ApiParam({ name: 'courseId', type: Number })
  @ApiResponse({ status: 200, description: 'List of students', type: [CreateEnrollmentDto] })
  students(@Param('courseId') courseId: string) {
    return this.enrollmentService.studentsInCourse(+courseId);
  }

  // =======================
  // عرض كل الكورسات لطالب معين
  // =======================
  @Get('student/:studentId')
  @Roles(Role.ADMIN, Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Admin/Student views all courses of a student-->يعرض المسؤول/الطالب جميع مقررات الطالب' })
  @ApiParam({ name: 'studentId', type: Number })
  @ApiResponse({ status: 200, description: 'List of courses', type: [CreateEnrollmentDto] })
  courses(@Param('studentId') studentId: string, @Req() request: any) {
    const user = request.user;
    // Check if student is accessing their own data
    if (user.role === Role.STUDENT && user.id !== +studentId) {
      throw new ForbiddenException('You can only view your own enrollments');
    }
    return this.enrollmentService.coursesForStudent(+studentId, user);
  }
}
