import { Controller, Post, Body, UseGuards, Patch, Param, Get, Req, Delete } from '@nestjs/common'
import { QuizService } from './quiz.service'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new quiz (Admin/Teacher only)' })
  @ApiResponse({ status: 201, description: 'Quiz successfully created.' })
  create(
    @Body() dto: CreateQuizDto,
    @GetUser('id') teacherId: number
  ) {
    return this.quizService.create(dto, teacherId)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a quiz (Admin/Teacher only)' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id') id: string,
    @Body() dto: CreateQuizDto,
    @GetUser('id') teacherId: number
  ) {
    return this.quizService.update(+id, dto, teacherId)
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a quiz (Admin/Teacher only)' })
  @ApiParam({ name: 'id', type: Number })
  publish(
    @Param('id') id: string,
    @GetUser('id') teacherId: number
  ) {
    return this.quizService.publish(+id, teacherId)
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all quizzes for a course (Admin/Teacher only)' })
  @ApiParam({ name: 'courseId', type: Number })
  findByCourse(@Param('courseId') courseId: string) {
    return this.quizService.findByCourse(+courseId)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific quiz by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(+id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a quiz (Admin/Teacher only)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string, @GetUser('id') teacherId: number) {
    return this.quizService.remove(+id, teacherId)
  }
}
