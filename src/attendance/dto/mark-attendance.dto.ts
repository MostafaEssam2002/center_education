
import { IsArray, IsEnum, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

export class StudentAttendanceDto {
    @IsInt()
    studentId: number;

    @IsOptional()
    @IsEnum(AttendanceStatus)
    status?: AttendanceStatus;
}

export class MarkBulkAttendanceDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StudentAttendanceDto)
    students: StudentAttendanceDto[];
}
