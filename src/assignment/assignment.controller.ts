import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards, ParseIntPipe, Query, Delete } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto, SubmitAssignmentDto, ReviewSubmissionDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) { }
  // ------------------- TEACHER -------------------
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  create(@Body() dto: CreateAssignmentDto, @Req() req) {
    return this.assignmentService.create(dto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentDto,
    @Req() req,
  ) {
    return this.assignmentService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    return this.assignmentService.remove(id, req.user.id);
  }

  // جدول التسليمات لكل assignment
  @Get(':id/submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  getSubmissions(
    @Param('id', ParseIntPipe) assignmentId: number,
    @Req() req,
    @Query() query?,
  ) {
    return this.assignmentService.getSubmissions(assignmentId, req.user.id);
  }

  // مراجعة تسليم طالب
  @Patch('submissions/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  reviewSubmission(
    @Param('id', ParseIntPipe) submissionId: number,
    @Body() dto: ReviewSubmissionDto,
    @Req() req,
  ) {
    return this.assignmentService.reviewSubmission(
      submissionId,
      req.user.id,
      dto,
    );
  }

  // ------------------- STUDENT -------------------

  // كل الواجبات للـ student
  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  getMyAssignments(@Req() req) {
    return this.assignmentService.getMyAssignments(req.user.id);
  }

  // submit assignment
  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  submitAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.assignmentService.submit(id, req.user.id, dto.filePath);
  }

  // اختياري: واجب حسب Chapter
  @Get('chapter/:chapterId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAssignmentsByChapter(
    @Param('chapterId', ParseIntPipe) chapterId: number,
  ) {
    return this.assignmentService.findByChapter(chapterId);
  }
}
