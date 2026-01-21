import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { unlink } from 'fs/promises';
import { join } from 'path';
@Injectable()
export class ChapterService {
  constructor(private prisma: PrismaService) { }
  async create(createChapterDto: CreateChapterDto, user: { userId: number, role: string, email: string }) {
    const course = await this.prisma.course.findUnique({
      where: { id: createChapterDto.courseId },
      select: { teacherId: true },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (user.role !== 'ADMIN' && course?.teacherId !== user.userId) {
      throw new ForbiddenException('You cannot add chapter to this course');
    }
    const lastChapter = await this.prisma.chapter.findFirst({
      where: { courseId: createChapterDto.courseId },
      orderBy: { order: 'desc' },
    });
    const order = createChapterDto.order ?? (lastChapter ? lastChapter.order + 1 : 1);

    return this.prisma.chapter.create(
      {
        data: {
          ...createChapterDto,
          videoPath: createChapterDto.videoPath || '', // لو حابب
          pdfPath: createChapterDto.pdfPath || null,
          order: order
        }
      })
  }

  async findAll(courseId: number, page: number, chapterPerPage: number) {
    const total = await this.prisma.chapter.count({ where: { courseId } });
    const data = await this.prisma.chapter.findMany({
      where: { courseId },
      skip: chapterPerPage * (page - 1),
      take: chapterPerPage,
      orderBy: { order: 'asc' },
    });
    return { data, total };
  }


  async findOne(id: number) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: { course: true }
    })
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    return chapter
  }

  async update(id: number, updateChapterDto: UpdateChapterDto) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id } });
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    const updatedChapter = await this.prisma.chapter.update({
      where: { id },
      data: updateChapterDto,
    });
    return updatedChapter;
  }

  async remove(id: number) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id } });
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    // حذف ملفات الفيديو وPDF من السيرفر لو موجودة
    if (chapter.videoPath) {
      await unlink(join(process.cwd(), 'public', 'videos', chapter.videoPath)).catch(() => { });
    }
    if (chapter.pdfPath) {
      await unlink(join(process.cwd(), 'public', 'pdfs', chapter.pdfPath)).catch(() => { });
    }

    await this.prisma.chapter.delete({ where: { id } });
    return { message: `Chapter with id ${id} has been deleted successfully.` };
  }

}
