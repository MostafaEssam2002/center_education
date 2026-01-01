import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseScheduleDto } from './create-course-schedule.dto';

export class UpdateCourseScheduleDto extends PartialType(
  CreateCourseScheduleDto,
) {}
