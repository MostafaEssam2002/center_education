import { IsInt, IsOptional } from 'class-validator';

export class SubmitAnswerDto {
  @IsInt()
  questionId: number;

  // لو حابب تدعم حذف الإجابة، خليها optional
  @IsOptional()
  @IsInt()
  optionId?: number;
}
