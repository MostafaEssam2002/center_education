import { Test, TestingModule } from '@nestjs/testing';
import { CourseScheduleController } from './course-schedule.controller';
import { CourseScheduleService } from './course-schedule.service';

describe('CourseScheduleController', () => {
  let controller: CourseScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseScheduleController],
      providers: [CourseScheduleService],
    }).compile();

    controller = module.get<CourseScheduleController>(CourseScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
