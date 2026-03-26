import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getStatistics() {
    const students = await this.prisma.user.count({ where: { role: 'STUDENT' } });
    const teachers = await this.prisma.user.count({ where: { role: 'TEACHER' } });
    const courses = await this.prisma.course.count();

    return {
      students,
      teachers,
      courses,
      satisfaction: 98,
    };
  }
}
