import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadFileModule } from './upload-file/upload-file.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { ChapterModule } from './chapter/chapter.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { ChapterProgressModule } from './chapter-progress/chapter-progress.module';

@Module({
  imports: [UploadFileModule, UserModule, AuthModule, CourseModule, ChapterModule, EnrollmentModule, ChapterProgressModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
