import { AssignmentSubmissionStatus } from '@prisma/client';
import {IsEnum,IsBoolean,IsDateString,IsInt,IsNotEmpty,IsOptional,IsString,Min,} from 'class-validator';
export class CreateAssignmentDto {
  @IsInt()
  chapterId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsInt()
  @Min(1)
  maxGrade: number;

  @IsBoolean()
  @IsOptional()
  allowLate?: boolean;
}

export class SubmitAssignmentDto {
  @IsString()
  @IsNotEmpty()
  filePath: string;
}
export class ReviewSubmissionDto {
  @IsInt()
  @Min(0)
  grade: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}

export class SubmissionQueryDto {
  @IsEnum(AssignmentSubmissionStatus)
  @IsOptional()
  status?: AssignmentSubmissionStatus;
}
