import { Controller, Get, Post, Body, Param, UseGuards, Delete } from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { SubmitAnswerDto } from './dto/submitAnswer.dto';

@Controller('quiz-attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class QuizAttemptController {
  constructor(private readonly service: QuizAttemptService) { }

  @Post('start/:quizId')
  startQuiz(@Param('quizId') quizId: string, @GetUser('id') studentId: number) {
    return this.service.startQuiz(+quizId, studentId);
  }

  @Post(':attemptId/answer')
  submitAnswer(
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitAnswerDto,
    @GetUser('id') studentId: number,
  ) {
    return this.service.submitAnswer(+attemptId, dto.questionId, dto.optionId, studentId);
  }

  @Post(':attemptId/finish')
  finishQuiz(@Param('attemptId') attemptId: string, @GetUser('id') studentId: number) {
    return this.service.finishQuiz(+attemptId, studentId);
  }

  @Get(':attemptId/review')
  @Roles(Role.STUDENT, Role.TEACHER)
  reviewAttempt(@Param('attemptId') attemptId: string, @GetUser('id') userId: number) {
    return this.service.reviewAttempt(+attemptId, userId);
  }

  @Delete(':attemptId/answer/:questionId')
  deleteAnswer(@Param('attemptId') attemptId: string, @Param('questionId') questionId: string, @GetUser('id') studentId: number,) {
    return this.service.deleteAnswer(+attemptId, +questionId, studentId);
  }
  @Get(':quizId/stats')
  @Roles(Role.TEACHER)
  getStats(@Param('quizId') quizId: string) {
    return this.service.getQuizStats(+quizId);
  }

}
