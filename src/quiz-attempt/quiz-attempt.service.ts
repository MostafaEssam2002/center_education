import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuizAttempt, QuizStatus } from '@prisma/client';

@Injectable()
export class QuizAttemptService {
  constructor(private prisma: PrismaService) { }

  private isTimedOut(attempt: QuizAttempt, durationMin: number) {
    const endTime = new Date(attempt.startedAt).getTime() + durationMin * 60 * 1000;
    return Date.now() > endTime;
  }

  async startQuiz(quizId: number, studentId: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: true, chapter: { include: { course: true } } },
    });

    if (!quiz || !quiz.isPublished) {
      throw new NotFoundException('Quiz not available');
    }

    // Check if student is enrolled in the course
    const courseId = quiz.courseId || quiz.chapter?.courseId;
    if (!courseId) {
      throw new NotFoundException('Course not found');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        unique_enrollment_student_course: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled in this course to take the quiz');
    }

    const existing = await this.prisma.quizAttempt.findFirst({
      where: {
        quizId: quizId,
        studentId: studentId,
      },
      include: { answers: true },
    });

    if (existing) {
      if (existing.status === QuizStatus.IN_PROGRESS) return existing;
      throw new ForbiddenException('Quiz already attempted');
    }

    try {
      return await this.prisma.quizAttempt.create({
        data: { quizId, studentId, status: QuizStatus.IN_PROGRESS },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const retryExisting = await this.prisma.quizAttempt.findFirst({
          where: { quizId, studentId },
          include: { answers: true },
        });

        if (retryExisting && retryExisting.status === QuizStatus.IN_PROGRESS) {
          return retryExisting;
        }
        throw new ForbiddenException('Quiz already attempted');
      }
      throw error;
    }
  }

  async submitAnswer(
    attemptId: number,
    questionId: number,
    optionId: number | undefined,
    studentId: number,
  ) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { quiz: true },
    });
    if (!attempt || attempt.studentId !== studentId) throw new ForbiddenException('Not allowed');
    if (attempt.status !== QuizStatus.IN_PROGRESS) throw new ForbiddenException('Quiz already finished');
    if (this.isTimedOut(attempt, attempt.quiz.durationMin)) {
      await this.prisma.quizAttempt.update({
        where: { id: attempt.id },
        data: { status: QuizStatus.TIMED_OUT },
      });
      throw new ForbiddenException('Quiz time is over');
    }

    if (optionId === undefined) {
      // حذف الإجابة
      return this.prisma.quizAttemptAnswer.delete({
        where: { attemptId_questionId: { attemptId, questionId } },
      });
    }

    const question = await this.prisma.quizQuestion.findUnique({ where: { id: questionId } });
    if (!question || question.quizId !== attempt.quizId)
      throw new ForbiddenException('Question does not belong to this quiz');

    const option = await this.prisma.quizOption.findUnique({ where: { id: optionId } });
    if (!option || option.questionId !== questionId)
      throw new ForbiddenException('Option does not belong to this question');

    console.log('=== DEBUG SUBMIT ANSWER ===');
    console.log(`Question ID: ${questionId}`);
    console.log(`Selected Option ID: ${optionId}`);
    console.log(`Is Correct (from DB): ${option.isCorrect}`);
    console.log('===========================');

    return this.prisma.quizAttemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      update: { optionId, isCorrect: option.isCorrect },
      create: { attemptId, questionId, optionId, isCorrect: option.isCorrect },
    });
  }

  async finishQuiz(attemptId: number, studentId: number) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { answers: { include: { question: true } } },
    });
    if (!attempt || attempt.studentId !== studentId) throw new ForbiddenException('Not allowed');
    if (attempt.status !== QuizStatus.IN_PROGRESS) throw new ForbiddenException('Quiz already finished');

    const score = attempt.answers.reduce((sum, a) => sum + (a.isCorrect ? a.question.marks : 0), 0);

    return this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { score, status: QuizStatus.SUBMITTED, submittedAt: new Date() },
    });
  }

  async reviewAttempt(attemptId: number, userId: number) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            course: true,
            chapter: { include: { course: true } },
            questions: { include: { options: true } }, // Include questions & options for review
          },
        },
        answers: { include: { question: true, option: true } },
        student: true, // Include student info for teacher review
      },
    })
    if (!attempt) throw new NotFoundException('Attempt not found')

    const course = attempt.quiz.course ?? attempt.quiz.chapter?.course
    const isTeacher = course?.teacherId === userId

    if (!isTeacher) {
      if (attempt.studentId !== userId) throw new ForbiddenException('Not allowed')
      // If student is reviewing, check if keepAnswers is enabled
      // OR if they just finished (sometimes you want immediate feedback)
      // But adhering to the rule:
      if (!attempt.quiz.keepAnswers) {
        // Allow basic score review but maybe hide specific answers if needed?
        // For now, let's strictly follow the flag for DETAILED review
        // You might want to allow viewing the score page regardless.
        // If this endpoint is for "Paper Review", then forbidden is correct.
        throw new ForbiddenException('Answers are hidden for this quiz')
      }
    }

    return attempt
  }

  async deleteAnswer(attemptId: number, questionId: number, studentId: number) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.studentId !== studentId) {
      throw new ForbiddenException('Not allowed');
    }

    if (attempt.status !== QuizStatus.IN_PROGRESS) {
      throw new ForbiddenException('Quiz already finished');
    }
    return this.prisma.quizAttemptAnswer.delete({
      where: { attemptId_questionId: { attemptId, questionId } },
    });
  }
  async getQuizStats(quizId: number) {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { quizId, status: QuizStatus.SUBMITTED },
      include: { student: true },
    });
    const totalAttempts = attempts.length;
    const averageScore = attempts.reduce((sum, a) => sum + a.score, 0) / (totalAttempts || 1);
    return {
      totalAttempts,
      averageScore,
      attempts,
    };
  }

}