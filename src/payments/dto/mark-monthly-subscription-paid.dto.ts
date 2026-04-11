import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class MarkMonthlySubscriptionPaidDto {
  @ApiProperty({ description: 'Optional payment transaction ID', example: 12345, required: false })
  @IsOptional()
  @IsInt()
  transactionId?: number;

  @ApiProperty({ description: 'Optional paid date as ISO string', example: '2026-04-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
