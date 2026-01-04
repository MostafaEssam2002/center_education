import { Module } from '@nestjs/common';
import { QuizQuestionService } from './quiz-question.service';
import { QuizQuestionController } from './quiz-question.controller';

@Module({
  controllers: [QuizQuestionController],
  providers: [QuizQuestionService],
})
export class QuizQuestionModule {}
