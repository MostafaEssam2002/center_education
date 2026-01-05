import { BadRequestException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto, ReviewSubmissionDto } from './dto/create-assignment.dto';
import { AssignmentSubmissionStatus } from '@prisma/client';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createDto: CreateAssignmentDto, teacherId: number) {
    // تأكد إن الـ chapter موجود
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: createDto.chapterId },
      include: { course: true },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    // Ownership check
    if (chapter.course.teacherId !== teacherId) {
      throw new ForbiddenException('You are not allowed to add assignment here');
    }

    return this.prisma.assignment.create({
      data: {
        title: createDto.title,
        description: createDto.description,
        dueDate: ((d) => { d.setHours(23, 59, 59, 999); return d; })(new Date(createDto.dueDate)),
        maxGrade: createDto.maxGrade,
        allowLate: createDto.allowLate ?? true,
        chapterId: createDto.chapterId,
        createdBy: teacherId,
      },
    });
  }

  async findByChapter(chapterId: number) {
    return this.prisma.assignment.findMany({
      where: { chapterId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async submit(assignmentId: number, studentId: number, filePath: string,) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        chapter: {
          include: { course: true },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    // تأكد إن الطالب مسجل في الكورس
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId: assignment.chapter.courseId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    // منع إعادة التسليم إلا لو الوقت لسه مخلصش ومش متصحح
    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: {
        assignmentId,
        studentId,
      },
    });

    const isLate = new Date() > assignment.dueDate;

    if (existing) {
      if (existing.status === AssignmentSubmissionStatus.REVIEWED) {
        throw new ForbiddenException('Cannot edit reviewed assignment');
      }

      if (isLate && !assignment.allowLate) {
        throw new BadRequestException('Cannot edit submission after due date');
      }

      // Update existing submission
      return this.prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: {
          filePath,
          submittedAt: new Date(),
          status: isLate ? AssignmentSubmissionStatus.LATE : AssignmentSubmissionStatus.SUBMITTED,
        },
      });
    }

    if (isLate && !assignment.allowLate) {
      throw new BadRequestException('Late submission is not allowed');
    }

    return this.prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        filePath,
        status: isLate ? AssignmentSubmissionStatus.LATE : AssignmentSubmissionStatus.SUBMITTED,
      },
    });
  }

  async getSubmissions(assignmentId: number, teacherId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        chapter: {
          include: { course: true },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.chapter.course.teacherId !== teacherId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        assignment: true,
        student: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async reviewSubmission(submissionId: number, teacherId: number, dto: ReviewSubmissionDto,) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            chapter: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.assignment.chapter.course.teacherId !== teacherId) {
      throw new ForbiddenException('You cannot review this submission');
    }

    if (dto.grade > submission.assignment.maxGrade) {
      throw new BadRequestException('Grade exceeds max grade');
    }

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: dto.grade,
        feedback: dto.feedback,
        status: AssignmentSubmissionStatus.REVIEWED,
      },
    });
  }
  async update(assignmentId: number, dto: UpdateAssignmentDto, teacherId: number,) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { chapter: { include: { course: true } } },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.chapter.course.teacherId !== teacherId) {
      throw new ForbiddenException('You cannot update this assignment');
    }

    return this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? ((d) => { d.setHours(23, 59, 59, 999); return d; })(new Date(dto.dueDate)) : undefined,
      },
    });
  }

  async getMyAssignments(studentId: number) {
    // تجيب كل الكورسات اللي الطالب مسجل فيها
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true },
    });

    const courseIds = enrollments.map(e => e.courseId);

    return this.prisma.assignment.findMany({
      where: { chapter: { courseId: { in: courseIds } } },
      include: {
        submissions: {
          where: { studentId },
          take: 1,
        },
        chapter: {
          include: { course: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async remove(id: number, teacherId: number) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { chapter: { include: { course: true } } },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.chapter.course.teacherId !== teacherId) {
      throw new ForbiddenException('You cannot delete this assignment');
    }

    return this.prisma.assignment.delete({
      where: { id },
    });
  }
}
