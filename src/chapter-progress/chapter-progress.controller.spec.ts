import { Test, TestingModule } from '@nestjs/testing';
import { ChapterProgressController } from './chapter-progress.controller';
import { ChapterProgressService } from './chapter-progress.service';

describe('ChapterProgressController', () => {
  let controller: ChapterProgressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChapterProgressController],
      providers: [ChapterProgressService],
    }).compile();

    controller = module.get<ChapterProgressController>(ChapterProgressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
