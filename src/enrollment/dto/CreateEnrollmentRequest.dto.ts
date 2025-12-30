import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentRequestDto {
  @ApiProperty({ description: 'Course ID to enroll in', example: 1 })
  @IsNotEmpty()
  @IsInt()
  courseId: number;
}
