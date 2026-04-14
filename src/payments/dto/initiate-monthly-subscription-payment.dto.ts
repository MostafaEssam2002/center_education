import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class InitiateMonthlySubscriptionPaymentDto {
  @ApiProperty({ description: 'Paymob Integration ID', example: 123456 })
  @IsInt()
  integration_id: number;

  @ApiPropertyOptional({ description: 'Wallet Phone Number', example: '010xxxxxxxx' })
  @IsOptional()
  @IsString()
  walletPhoneNumber?: string;
}
