import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateMonthlySubscriptionDto {
  @ApiProperty({ description: 'Course ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  courseId: number;

  @ApiProperty({ description: 'Month number (1-12)', example: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  month: number;

  @ApiProperty({ description: 'Year', example: 2026 })
  @IsNotEmpty()
  @IsInt()
  year: number;

  @ApiProperty({ description: 'Amount in cents', example: 100000 })
  @IsNotEmpty()
  @IsInt()
  amountCents: number;
}
