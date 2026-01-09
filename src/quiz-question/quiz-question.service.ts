import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuizQuestionService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateQuizQuestionDto, teacherId: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
      include: { course: true, chapter: { include: { course: true } } },
    })
    if (!quiz) throw new NotFoundException('Quiz not found')

    const ownerId = quiz.course?.teacherId ?? quiz.chapter?.course.teacherId
    if (ownerId !== teacherId)
      throw new ForbiddenException('Not allowed to add question to this quiz')
    return this.prisma.quizQuestion.create({
      data: { quizId: dto.quizId, question: dto.question, marks: dto.marks },
    })
  }

  async findAll(quizId: number) {
    return this.prisma.quizQuestion.findMany({
      where: { quizId },
      include: { options: true },
    })
  }

  async update(
    id: number,
    dto: Partial<CreateQuizQuestionDto>,
    teacherId: number
  ) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id },
      include: { quiz: { include: { course: true, chapter: { include: { course: true } } } } },
    })
    if (!question) throw new NotFoundException('Question not found')

    const ownerId = question.quiz.course?.teacherId ?? question.quiz.chapter?.course.teacherId
    if (ownerId !== teacherId)
      throw new ForbiddenException('Not allowed to update this question')

    return this.prisma.quizQuestion.update({
      where: { id },
      data: {
        question: dto.question,
        marks: dto.marks,
      },
    })
  }

  async remove(id: number, teacherId: number) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id },
      include: { quiz: { include: { course: true, chapter: { include: { course: true } } } } },
    })
    if (!question) throw new NotFoundException('Question not found')

    const ownerId = question.quiz.course?.teacherId ?? question.quiz.chapter?.course.teacherId
    if (ownerId !== teacherId)
      throw new ForbiddenException('Not allowed to delete this question')

    return this.prisma.$transaction(async (prisma) => {
      // 1. Delete all answers related to this question (if any)
      await prisma.quizAttemptAnswer.deleteMany({
        where: { questionId: id },
      });

      // 2. Delete all options related to this question
      await prisma.quizOption.deleteMany({
        where: { questionId: id },
      });

      // 3. Delete the question itself
      return prisma.quizQuestion.delete({
        where: { id },
      });
    });
  }
}

