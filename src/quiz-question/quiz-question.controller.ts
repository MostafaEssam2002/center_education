import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { QuizQuestionService } from './quiz-question.service';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('quiz-questions')
export class QuizQuestionController {
  constructor(private readonly service: QuizQuestionService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  create(@Body() dto: CreateQuizQuestionDto, @GetUser('id') teacherId: number) {
    // console.log(teacherId)
    return this.service.create(dto, teacherId)
  }

  @Get(':quizId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  findAll(
    @Param('quizId') quizId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.service.findAll(+quizId, page, limit)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateQuizQuestionDto>,
    @GetUser('id') teacherId: number
  ) {
    return this.service.update(+id, dto, teacherId)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string, @GetUser('id') teacherId: number) {
    return this.service.remove(+id, teacherId)
  }
}

