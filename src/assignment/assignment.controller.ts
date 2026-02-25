import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards, ParseIntPipe, Query, Delete } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto, SubmitAssignmentDto, ReviewSubmissionDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Assignments')
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) { }

  // ------------------- TEACHER -------------------
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new assignment (Teacher only)' })
  @ApiResponse({ status: 201, description: 'Assignment successfully created.' })
  create(@Body() dto: CreateAssignmentDto, @Req() req) {
    return this.assignmentService.create(dto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an assignment (Teacher only)' })
  @ApiParam({ name: 'id', type: Number })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an assignment (Teacher only)' })
  @ApiParam({ name: 'id', type: Number })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    return this.assignmentService.remove(id, req.user.id);
  }

  @Get(':id/submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all submissions for an assignment (Teacher only)' })
  @ApiParam({ name: 'id', type: Number })
  getSubmissions(
    @Param('id', ParseIntPipe) assignmentId: number,
    @Req() req,
    @Query() query?,
  ) {
    return this.assignmentService.getSubmissions(assignmentId, req.user.id);
  }

  @Patch('submissions/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Review a student submission (Teacher only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Submission ID' })
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

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get assignments for current student' })
  getMyAssignments(@Req() req) {
    return this.assignmentService.getMyAssignments(req.user.id);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit an assignment (Student only)' })
  @ApiParam({ name: 'id', type: Number })
  submitAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.assignmentService.submit(id, req.user.id, dto.filePath);
  }

  @Get('chapter/:chapterId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get assignments by chapter ID' })
  @ApiParam({ name: 'chapterId', type: Number })
  getAssignmentsByChapter(
    @Param('chapterId', ParseIntPipe) chapterId: number,
  ) {
    return this.assignmentService.findByChapter(chapterId);
  }
}
