import { Module } from '@nestjs/common';
import { QuizOptionService } from './quiz-option.service';
import { QuizOptionController } from './quiz-option.controller';

@Module({
  controllers: [QuizOptionController],
  providers: [QuizOptionService],
})
export class QuizOptionModule {}
