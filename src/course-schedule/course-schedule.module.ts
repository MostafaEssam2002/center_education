import { Module } from '@nestjs/common';
import { CourseScheduleService } from './course-schedule.service';
import { CourseScheduleController } from './course-schedule.controller';

@Module({
  controllers: [CourseScheduleController],
  providers: [CourseScheduleService],
})
export class CourseScheduleModule {}
