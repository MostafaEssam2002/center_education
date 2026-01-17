import { DayOfWeek } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, } from 'class-validator';

export class CreateCourseScheduleDto {
  @IsInt()
  courseId: number;

  @IsEnum(DayOfWeek)
  day: DayOfWeek;

  /**
   * HH:mm format
   * مثال: 10:00
   */
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string;

  @IsInt()
  @IsNotEmpty()
  roomId: number;
}
