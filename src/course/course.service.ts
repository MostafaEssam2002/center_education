import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) { }

  // ================= CREATE COURSE =================
  async create(createCourseDto: CreateCourseDto, teacherId: number) {
    const created = await this.prisma.course.create({
      data: {
        title: createCourseDto.title,
        description: createCourseDto.description,
        teacherId,
        image_path: createCourseDto.imagePath || createCourseDto.image_path,
        price: createCourseDto.price,
        discount: createCourseDto.discount,
        paymentType: createCourseDto.paymentType,
        monthlyPrice: createCourseDto.monthlyPrice
      },
      include: {
        teacher: true,
      },
    });

    return {
      data: created,
      message: 'created successfully',
      status: 1,
    };
  }

  // ================= GET ALL COURSES =================
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        skip,
        take: limit,
        include: {
          teacher: true,
          chapters: true,
          enrollments: true,
          schedules: {
            include: {
              room: true
            }
          },
          _count: {
            select: { requests: true, enrollments: true }
          }
        },
      }),
      this.prisma.course.count(),
    ]);

    return {
      data: courses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ================= FIND ONE COURSE =================
  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: true,
        chapters: true,
        enrollments: true,
        schedules: {
          include: {
            room: true
          }
        },
        _count: {
          select: { requests: true, enrollments: true }
        }
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }

    return{
      data: course,
      message: 'retrieved successfully',
      status: 1,
    };
  }

  // ================= SEARCH BY TITLE =================
  async findByTitle(title: string) {
    return this.prisma.course.findMany({
      where: {
        title: {
          contains: title,
        },
      },
      include: {
        teacher: true,
        enrollments: true,
      },
    });
  }

  // ================= UPDATE COURSE =================
  async update(id: number, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        image_path: dto.imagePath || dto.image_path,
        price: dto.price,
        discount: dto.discount
      },
    });

    return {
      data:  updated,
      message: 'updated successfully',
      status: 1,
    };
  }

  // ================= DELETE COURSE =================
  async remove(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with id ${id} not found`);
    }

    const deleted = await this.prisma.course.delete({
      where: { id },
    });
    return {
      data: "",
      message: 'deleted successfully',
      status: 1,
    };
  }
}
