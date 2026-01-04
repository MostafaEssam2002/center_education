import { IsEnum, IsInt, IsOptional, IsString, IsBoolean, IsDateString, Min } from 'class-validator'
import { QuizType } from '@prisma/client'

export class CreateQuizDto {
  @IsString()
  title: string
  @IsOptional()
  @IsString()
  description?: string
  @IsEnum(QuizType)
  type: QuizType
  @IsOptional()
  @IsInt()
  chapterId?: number
  @IsOptional()
  @IsInt()
  courseId?: number
  @IsDateString()
  startTime: string
  @IsDateString()
  endTime: string
  @IsInt()
  @Min(1)
  durationMin: number
  @IsInt()
  @Min(1)
  totalMarks: number
  @IsOptional()
  @IsBoolean()
  keepAnswers?: boolean
}