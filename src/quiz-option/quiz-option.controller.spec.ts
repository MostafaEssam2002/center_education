import { Test, TestingModule } from '@nestjs/testing';
import { QuizOptionController } from './quiz-option.controller';
import { QuizOptionService } from './quiz-option.service';

describe('QuizOptionController', () => {
  let controller: QuizOptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizOptionController],
      providers: [QuizOptionService],
    }).compile();

    controller = module.get<QuizOptionController>(QuizOptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
