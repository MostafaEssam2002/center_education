import { Module } from '@nestjs/common';
import { ChapterProgressService } from './chapter-progress.service';
import { ChapterProgressController } from './chapter-progress.controller';

@Module({
  controllers: [ChapterProgressController],
  providers: [ChapterProgressService],
})
export class ChapterProgressModule {}
