import { IsInt, IsString, IsBoolean } from 'class-validator';

export class CreateQuizOptionDto {
  @IsInt()
  questionId: number;

  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}
