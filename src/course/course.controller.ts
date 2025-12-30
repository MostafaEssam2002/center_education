import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { OwnershipGuard } from './guards/ownership/ownership.guard';


@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
  @Roles(Role.ADMIN,Role.TEACHER)
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get('search')
  findByTitle(@Query('title') title: string) {
    return this.courseService.findByTitle(title);
  }
  @Roles(Role.ADMIN,Role.TEACHER)
  @UseGuards(JwtAuthGuard,RolesGuard,OwnershipGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number,@Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }
  
  @Roles(Role.ADMIN,Role.TEACHER)
  @UseGuards(JwtAuthGuard,RolesGuard,OwnershipGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.remove(id);
  }
}
