import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { unlink, rm } from 'fs/promises';
import { join, dirname } from 'path';
@Injectable()
export class ChapterService {
  constructor(private prisma: PrismaService) { }
  async create(createChapterDto: CreateChapterDto, user: { id: number, role: string, email: string }) {
    const course = await this.prisma.course.findUnique({
      where: { id: createChapterDto.courseId },
      select: { teacherId: true },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (user.role !== 'ADMIN' && course?.teacherId !== user.id) {
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

  findAll(courseId: number) {
    return this.prisma.chapter.findMany({
      where: { courseId },
      orderBy: { order: 'asc' }, // لو عايز ترتيبهم
    });
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
      try {
        const cleanPath = chapter.videoPath.startsWith('/') ? chapter.videoPath.substring(1) : chapter.videoPath;
        const fullPath = join(process.cwd(), 'public', cleanPath);

        if (fullPath.endsWith('index.m3u8')) {
          // It's an HLS video folder, delete the entire folder
          const videoDir = dirname(fullPath);
          await rm(videoDir, { recursive: true, force: true });
        } else {
          // Regular file
          await unlink(fullPath);
        }
      } catch (err) {
        console.error(`Failed to delete video for chapter ${id}:`, err);
      }
    }

    if (chapter.pdfPath) {
      try {
        const cleanPath = chapter.pdfPath.startsWith('/') ? chapter.pdfPath.substring(1) : chapter.pdfPath;
        const fullPath = join(process.cwd(), 'public', cleanPath);
        await unlink(fullPath);
      } catch (err) {
        console.error(`Failed to delete PDF for chapter ${id}:`, err);
      }
    }

    await this.prisma.chapter.delete({ where: { id } });
    return { message: `Chapter with id ${id} has been deleted successfully.` };
  }

}
