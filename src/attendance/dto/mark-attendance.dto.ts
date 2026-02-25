import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

export class StudentAttendanceDto {
    @ApiProperty({ description: 'ID of the student' })
    @IsInt()
    studentId: number;

    @ApiPropertyOptional({ description: 'Attendance status', enum: AttendanceStatus })
    @IsOptional()
    @IsEnum(AttendanceStatus)
    status?: AttendanceStatus;
}

export class MarkBulkAttendanceDto {
    @ApiProperty({ type: [StudentAttendanceDto], description: 'List of student attendance records' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StudentAttendanceDto)
    students: StudentAttendanceDto[];
}
