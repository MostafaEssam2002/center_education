import { Test, TestingModule } from '@nestjs/testing';
import { QuizAttemptController } from './quiz-attempt.controller';
import { QuizAttemptService } from './quiz-attempt.service';

describe('QuizAttemptController', () => {
  let controller: QuizAttemptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizAttemptController],
      providers: [QuizAttemptService],
    }).compile();

    controller = module.get<QuizAttemptController>(QuizAttemptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
