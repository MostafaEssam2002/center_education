import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [CourseController],
  providers: [CourseService],
  imports: [PrismaModule]
})
export class CourseModule { }
