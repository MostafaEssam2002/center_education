import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from '@prisma/client';
import { OwnershipGuard } from './guards/ownership/ownership.guard';
import { ChapterAccessGuard } from './guards/chapter-access-guard/chapter-access-guard.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Chapter')
@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) { }

  @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new chapter' })
  @ApiResponse({ status: 201, description: 'Chapter successfully created.' })
  create(@Body() createChapterDto: CreateChapterDto, @Req() request: any) {
    const user = request.user;
    return this.chapterService.create(createChapterDto, user);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all chapters for a specific course' })
  @ApiParam({ name: 'courseId', type: Number, description: 'ID of the course' })
  findAll(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.chapterService.findAll(+courseId);
  }

  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard, ChapterAccessGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific chapter by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the chapter' })
  findOne(@Param('id') id: string) {
    return this.chapterService.findOne(+id);
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a chapter' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the chapter' })
  update(@Param('id') id: string, @Body() updateChapterDto: UpdateChapterDto) {
    return this.chapterService.update(+id, updateChapterDto);
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chapter' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the chapter' })
  remove(@Param('id') id: string) {
    return this.chapterService.remove(+id);
  }
}
