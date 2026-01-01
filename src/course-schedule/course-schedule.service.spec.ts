import { Test, TestingModule } from '@nestjs/testing';
import { CourseScheduleService } from './course-schedule.service';

describe('CourseScheduleService', () => {
  let service: CourseScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseScheduleService],
    }).compile();

    service = module.get<CourseScheduleService>(CourseScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
