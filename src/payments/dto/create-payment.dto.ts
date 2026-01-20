import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
    @ApiProperty({ description: 'Enrollment Request ID', example: 1 })
    @IsNotEmpty()
    @IsInt()
    enrollmentRequestId: number;

    @ApiProperty({ description: 'Paymob Integration ID', example: 123456 })
    @IsNotEmpty()
    @IsInt()
    integration_id: number;

    @ApiProperty({ description: 'Wallet Phone Number', example: '010xxxxxxxx', required: false })
    @IsOptional()
    @IsString()
    walletPhoneNumber?: string;
}
