import { Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ChapterController],
  providers: [ChapterService],
  imports: [PrismaModule],
})
export class ChapterModule {}
