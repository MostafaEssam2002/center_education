import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuizOptionDto } from './dto/create-quiz-option.dto';
import { UpdateQuizOptionDto } from './dto/update-quiz-option.dto';

@Injectable()
export class QuizOptionService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateQuizOptionDto, teacherId: number) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: dto.questionId },
      include: { quiz: { include: { course: true, chapter: { include: { course: true } } } } },
    });

    if (!question) throw new NotFoundException('Question not found');

    const ownerId = question.quiz.course?.teacherId ?? question.quiz.chapter?.course.teacherId;
    if (ownerId !== teacherId)
      throw new ForbiddenException('Not allowed to add option to this question');

    return this.prisma.quizOption.create({
      data: { questionId: dto.questionId, text: dto.text, isCorrect: dto.isCorrect },
    });
  }

  async findAll(questionId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [options, total] = await Promise.all([
      this.prisma.quizOption.findMany({
        where: { questionId },
        skip,
        take: limit,
      }),
      this.prisma.quizOption.count({ where: { questionId } }),
    ]);

    return {
      data: options,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, dto: UpdateQuizOptionDto, teacherId: number) {
    const option = await this.prisma.quizOption.findUnique({
      where: { id },
      include: { question: { include: { quiz: { include: { course: true, chapter: { include: { course: true } } } } } } },
    });

    if (!option) throw new NotFoundException('Option not found');

    const ownerId = option.question.quiz.course?.teacherId ?? option.question.quiz.chapter?.course.teacherId;
    if (ownerId !== teacherId)
      throw new ForbiddenException('Not allowed to update this option');

    return this.prisma.quizOption.update({
      where: { id },
      data: { text: dto.text, isCorrect: dto.isCorrect },
    });
  }

  async remove(id: number, teacherId: number) {
    const option = await this.prisma.quizOption.findUnique({
      where: { id },
      include: { question: { include: { quiz: { include: { course: true, chapter: { include: { course: true } } } } } } },
    });

    if (!option) throw new NotFoundException('Option not found');

    const ownerId = option.question.quiz.course?.teacherId ?? option.question.quiz.chapter?.course.teacherId;
    if (ownerId !== teacherId)
      throw new ForbiddenException('Not allowed to delete this option');

    return this.prisma.quizOption.delete({ where: { id } });
  }
}
