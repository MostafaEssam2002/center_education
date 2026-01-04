import { IsInt } from 'class-validator';

export class StartQuizDto {
  @IsInt()
  quizId: number;
}
