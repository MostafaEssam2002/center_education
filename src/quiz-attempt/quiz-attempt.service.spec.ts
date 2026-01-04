import { Test, TestingModule } from '@nestjs/testing';
import { QuizAttemptService } from './quiz-attempt.service';

describe('QuizAttemptService', () => {
  let service: QuizAttemptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizAttemptService],
    }).compile();

    service = module.get<QuizAttemptService>(QuizAttemptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
