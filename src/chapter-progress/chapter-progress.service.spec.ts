import { Test, TestingModule } from '@nestjs/testing';
import { ChapterProgressService } from './chapter-progress.service';

describe('ChapterProgressService', () => {
  let service: ChapterProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChapterProgressService],
    }).compile();

    service = module.get<ChapterProgressService>(ChapterProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
