import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { QuizType } from '@prisma/client'

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateQuizDto, teacherId: number) {
    // =========================
    // 1️⃣ Basic Validation
    // =========================
    if (dto.type === QuizType.CHAPTER && !dto.chapterId) {
      throw new BadRequestException('Chapter quiz must have chapterId')
    }

    if (dto.type === QuizType.FINAL && !dto.courseId) {
      throw new BadRequestException('Final quiz must have courseId')
    }

    const startTime = new Date(dto.startTime)
    const endTime = new Date(dto.endTime)

    if (startTime >= endTime) {
      throw new BadRequestException('Invalid quiz time range')
    }

    // =========================
    // 2️⃣ Ownership Check
    // =========================
    let courseId: number | null = null

    if (dto.type === QuizType.CHAPTER) {
      const chapter = await this.prisma.chapter.findUnique({
        where: { id: dto.chapterId },
        include: { course: true },
      })

      if (!chapter) {
        throw new NotFoundException('Chapter not found')
      }

      if (chapter.course.teacherId !== teacherId) {
        throw new ForbiddenException(
          'You are not allowed to create quiz for this chapter',
        )
      }

      courseId = chapter.courseId
    }

    if (dto.type === QuizType.FINAL) {
      const course = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
      })

      if (!course) {
        throw new NotFoundException('Course not found')
      }

      if (course.teacherId !== teacherId) {
        throw new ForbiddenException(
          'You are not allowed to create quiz for this course',
        )
      }

      courseId = course.id
    }

    if (!courseId) {
      throw new BadRequestException('Invalid quiz target')
    }

    // =========================
    // 3️⃣ Create Quiz
    // =========================
    return this.prisma.quiz.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        chapterId: dto.type === QuizType.CHAPTER ? dto.chapterId : null,
        courseId,
        startTime,
        endTime,
        durationMin: dto.durationMin,
        totalMarks: dto.totalMarks,
        keepAnswers: dto.keepAnswers ?? false,
        createdBy: teacherId,
      },
    })
  }

  async update(id: number, dto: Partial<CreateQuizDto>, teacherId: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        course: true,
        chapter: { include: { course: true } },
      },
    })

    if (!quiz) throw new NotFoundException('Quiz not found')

    const ownerId = quiz.course?.teacherId ?? quiz.chapter?.course.teacherId
    if (ownerId !== teacherId) {
      throw new ForbiddenException('You are not allowed to update this quiz')
    }

    return this.prisma.quiz.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        startTime: dto.startTime,
        endTime: dto.endTime,
        durationMin: dto.durationMin,
        totalMarks: dto.totalMarks,
        keepAnswers: dto.keepAnswers,
      },
    })
  }

  async publish(id: number, teacherId: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
        course: true,
        chapter: {
          include: { course: true },
        },
      },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    if (quiz.isPublished) {
      throw new BadRequestException('Quiz already published')
    }

    if (quiz.questions.length === 0) {
      throw new BadRequestException('Cannot publish quiz without questions')
    }

    const ownerId =
      quiz.course?.teacherId ?? quiz.chapter?.course.teacherId

    if (ownerId !== teacherId) {
      throw new ForbiddenException(
        'You are not allowed to publish this quiz',
      )
    }

    const currentTotal = quiz.questions.reduce((sum, q) => sum + q.marks, 0);
    if (currentTotal !== quiz.totalMarks) {
      throw new BadRequestException(
        `Sum of question marks (${currentTotal}) does not match Quiz Total Marks (${quiz.totalMarks})`
      );
    }

    return this.prisma.quiz.update({
      where: { id },
      data: { isPublished: true },
    })
  }

  async findByCourse(courseId: number) {
    return this.prisma.quiz.findMany({
      where: { courseId },
      include: {
        questions: true,
        chapter: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findOne(id: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: { options: true },
        },
      },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    return quiz
  }

  async remove(id: number, teacherId: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        course: true,
        chapter: { include: { course: true } },
      },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    const ownerId =
      quiz.course?.teacherId ?? quiz.chapter?.course.teacherId

    if (ownerId !== teacherId) {
      throw new ForbiddenException(
        'You are not allowed to delete this quiz',
      )
    }

    return this.prisma.quiz.delete({
      where: { id },
    })
  }
}
