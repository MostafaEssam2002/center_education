import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsOptional()
    image_path?: string;
    @IsNotEmpty()
    @IsEmail()
    email: string;
    @IsNotEmpty()
    first_name: string;
    @IsNotEmpty()
    last_name: string
    @IsNotEmpty()
    @IsNumber()
    age: number;
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(15)
    password: string;
    @IsPhoneNumber()
    phone?: string;
    @IsNotEmpty()
    address?: string;
    @IsNotEmpty()
    @IsEnum( Role)
    role: Role;
}

