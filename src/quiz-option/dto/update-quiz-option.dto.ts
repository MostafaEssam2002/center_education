import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateQuizOptionDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
