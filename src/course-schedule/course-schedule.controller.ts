import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { CourseScheduleService } from './course-schedule.service';
import { CreateCourseScheduleDto } from './dto/create-course-schedule.dto';
import { UpdateCourseScheduleDto } from './dto/update-course-schedule.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from '@prisma/client';
@Controller('course-schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseScheduleController {
  constructor(private readonly service: CourseScheduleService) { }
  // ===============================
  // CREATE (ADMIN / EMPLOYEE)
  // ===============================
  @Post()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  create(@Body() dto: CreateCourseScheduleDto) {
    return this.service.create(dto);
  }
  // ===============================
  // UPDATE (ADMIN / EMPLOYEE)
  // ===============================
  @Patch(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseScheduleDto,) {
    return this.service.update(id, dto);
  }
  // ===============================
  // DELETE (ADMIN / EMPLOYEE)
  // ===============================
  @Delete(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
  // ===============================
  // GET weekly schedule (ALL)
  // ===============================
  @Get('weekly')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.STUDENT, Role.TEACHER,)
  findWeeklySchedule() {
    return this.service.findWeeklySchedule();
  }

  // ===============================
  // GET student schedule
  // ===============================
  @Get('student')
  @Roles(Role.STUDENT)
  findStudentSchedule(@Req() req) {
    return this.service.findStudentSchedule(req.user.userId);
  }
}