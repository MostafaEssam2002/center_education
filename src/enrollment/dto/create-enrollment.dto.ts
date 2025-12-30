import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
    @ApiProperty({ description: 'Student ID', example: 1 })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    studentId: number;

    @ApiProperty({ description: 'Course ID', example: 1 })
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    courseId: number;
}
