import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseIntPipe, } from '@nestjs/common';
import { ChapterProgressService } from './chapter-progress.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiParam, ApiResponse, } from '@nestjs/swagger';

@ApiTags('Chapter Progress | تقدم الفصول')
@ApiBearerAuth()
@Controller('chapter-progress')
export class ChapterProgressController {
  constructor(private readonly service: ChapterProgressService) { }

  /**
   * ===========================
   * تحديث progress فيديو الشابتر
   * Update chapter video progress
   * ===========================
   */
  @Post('video')
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'تحديث تقدم مشاهدة فيديو الشابتر | Update chapter video progress', description: 'الطالب يحدث نسبة مشاهدة الفيديو (0 → 100). لا يسمح بتقليل التقدم.\nStudent updates video progress percentage (0 → 100). Progress cannot decrease.', })
  @ApiBody({ schema: { type: 'object', properties: { chapterId: { type: 'number', example: 3, description: 'رقم الشابتر | Chapter ID', }, progress: { type: 'number', example: 75, description: 'نسبة المشاهدة | Watch percentage (0 - 100)', }, }, required: ['chapterId', 'progress'], }, })
  @ApiResponse({ status: 200, description: 'تم تحديث التقدم بنجاح | Progress updated successfully', })
  updateVideoProgress(@Body() body: { chapterId: number; progress: number }, @Req() req: any,) {
    const studentId = req.user.id;
    return this.service.updateVideoProgress(
      studentId,
      body.chapterId,
      body.progress,
    );
  }

  /**
   * ===========================
   * جلب تقدم الكورس بالكامل
   * Get full course progress
   * ===========================
   */
  @Get('course/:courseId')
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'تقدم الكورس بالكامل | Get full course progress', description: 'يعيد متوسط تقدم جميع الشابترز في الكورس.\nReturns average progress of all chapters in the course.', })
  @ApiParam({ name: 'courseId', type: Number, example: 5, description: 'رقم الكورس | Course ID', })
  @ApiResponse({ status: 200, description: 'تم جلب تقدم الكورس | Course progress retrieved', })
  getCourseProgress(@Param('courseId', ParseIntPipe) courseId: number, @Req() req: any,) {
    // console.log("hello from chapter progress controller in function getCourseProgress")
    const studentId = req.user.id;
    return this.service.getCourseProgress(studentId, courseId);
  }

  /**
   * ===========================
   * جلب تقدم شابتر واحد
   * Get single chapter progress
   * ===========================
   */
  @Get('chapter/:chapterId')
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'تقدم شابتر معين | Get chapter progress', description: 'يعيد نسبة التقدم في شابتر محدد.\nReturns progress percentage for a specific chapter.', })
  @ApiParam({ name: 'chapterId', type: Number, example: 10, description: 'رقم الشابتر | Chapter ID', })
  @ApiResponse({ status: 200, description: 'تم جلب تقدم الشابتر | Chapter progress retrieved', })
  getChapterProgress(@Param('chapterId', ParseIntPipe) chapterId: number, @Req() req: any,) {
    const studentId = req.user.id;
    return this.service.getChapterProgress(studentId, chapterId);
  }
}
