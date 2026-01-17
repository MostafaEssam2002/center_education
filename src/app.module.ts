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
import { CourseScheduleModule } from './course-schedule/course-schedule.module';
import { AttendanceModule } from './attendance/attendance.module';
// import { QuizModule } from './quiz/quiz.module';
// import { QuizQuestionModule } from './quiz-question/quiz-question.module';
// import { QuizOptionModule } from './quiz-option/quiz-option.module';
// import { QuizAttemptModule } from './quiz-attempt/quiz-attempt.module';
import { QuizModule } from './quiz/quiz.module';
import { QuizQuestionModule } from './quiz-question/quiz-question.module';
import { QuizOptionModule } from './quiz-option/quiz-option.module';
import { QuizAttemptModule } from './quiz-attempt/quiz-attempt.module';
import { AssignmentModule } from './assignment/assignment.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [UploadFileModule, UserModule, AuthModule, CourseModule, ChapterModule, EnrollmentModule, ChapterProgressModule, CourseScheduleModule, AttendanceModule, QuizModule, QuizQuestionModule, QuizOptionModule, QuizAttemptModule, AssignmentModule, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
