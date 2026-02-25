import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiPropertyOptional({ description: 'Path to user profile image' })
    @IsOptional()
    image_path?: string;

    @ApiProperty({ description: 'User email address' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'User first name' })
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ description: 'User last name' })
    @IsNotEmpty()
    last_name: string

    @ApiProperty({ description: 'User age' })
    @IsNotEmpty()
    @IsNumber()
    age: number;

    @ApiProperty({ description: 'User password', minLength: 6, maxLength: 15 })
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(15)
    password: string;

    @ApiPropertyOptional({ description: 'User phone number' })
    @IsPhoneNumber()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ description: 'User address' })
    @IsNotEmpty()
    @IsOptional()
    address?: string;

    @ApiProperty({ description: 'User role', enum: Role })
    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;

    @ApiPropertyOptional({ description: 'User country' })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional({ description: 'User city' })
    @IsOptional()
    city?: string;

    @ApiPropertyOptional({ description: 'User region' })
    @IsOptional()
    region?: string;
}
