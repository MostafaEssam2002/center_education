import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class MarkSingleAttendanceDto {
    @ApiProperty({ description: 'ID of the session' })
    @IsInt()
    sessionId: number;

    @ApiProperty({ description: 'ID of the student' })
    @IsInt()
    studentId: number;

    @ApiPropertyOptional({ description: 'Attendance status', enum: AttendanceStatus })
    @IsEnum(AttendanceStatus)
    @IsOptional()
    status?: AttendanceStatus;
}
