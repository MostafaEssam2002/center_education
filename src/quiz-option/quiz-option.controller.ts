import { Controller, Post, Body, Patch, Param, Delete, Get, UseGuards, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { QuizOptionService } from './quiz-option.service';
import { CreateQuizOptionDto } from './dto/create-quiz-option.dto';
import { UpdateQuizOptionDto } from './dto/update-quiz-option.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('quiz-options')
export class QuizOptionController {
  constructor(private readonly service: QuizOptionService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  create(@Body() dto: CreateQuizOptionDto, @GetUser('id') teacherId: number) {
    console.log(`teacherId = ${teacherId}`)
    return this.service.create(dto, teacherId);
  }

  @Get(':questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  findAll(
    @Param('questionId') questionId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.service.findAll(+questionId, page, limit);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() dto: UpdateQuizOptionDto, @GetUser('id') teacherId: number) {
    return this.service.update(+id, dto, teacherId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string, @GetUser('id') teacherId: number) {
    return this.service.remove(+id, teacherId);
  }
}
