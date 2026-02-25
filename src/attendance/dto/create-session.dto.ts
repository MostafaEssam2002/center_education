import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateSessionDto {
    @ApiProperty({ description: 'ID of the course' })
    @IsInt()
    courseId: number;

    @ApiProperty({ description: 'Date of the session', example: '2023-12-01' })
    @IsDateString()
    date: string;

    @ApiProperty({ description: 'Start time of the session', example: '08:00' })
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({ description: 'End time of the session', example: '09:00' })
    @IsString()
    @IsNotEmpty()
    endTime: string;

    @ApiProperty({ description: 'ID of the room' })
    @IsInt()
    roomId: number;
}
