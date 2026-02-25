import { AssignmentSubmissionStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'ID of the chapter this assignment belongs to' })
  @IsInt()
  chapterId: number;

  @ApiProperty({ description: 'Title of the assignment' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Description of the assignment' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Due date of the assignment', example: '2023-12-31T23:59:59Z' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Maximum grade for the assignment' })
  @IsInt()
  @Min(1)
  maxGrade: number;

  @ApiPropertyOptional({ description: 'Whether late submissions are allowed', default: false })
  @IsBoolean()
  @IsOptional()
  allowLate?: boolean;
}

export class SubmitAssignmentDto {
  @ApiProperty({ description: 'Path to the submitted assignment file' })
  @IsString()
  @IsNotEmpty()
  filePath: string;
}

export class ReviewSubmissionDto {
  @ApiProperty({ description: 'Grade assigned to the submission' })
  @IsInt()
  @Min(0)
  grade: number;

  @ApiPropertyOptional({ description: 'Feedback for the submission' })
  @IsString()
  @IsOptional()
  feedback?: string;
}

export class SubmissionQueryDto {
  @ApiPropertyOptional({ description: 'Filter by submission status', enum: AssignmentSubmissionStatus })
  @IsEnum(AssignmentSubmissionStatus)
  @IsOptional()
  status?: AssignmentSubmissionStatus;
}
