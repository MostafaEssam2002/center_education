import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, Query, DefaultValuePipe } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from '@prisma/client';
import { OwnershipGuard } from './guards/ownership/ownership.guard';
import { ChapterAccessGuard } from './guards/chapter-access-guard/chapter-access-guard.guard';

@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}
  @Roles(Role.ADMIN,Role.TEACHER)
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Post()
  create(@Body() createChapterDto: CreateChapterDto,@Req() request: any) {
    const user = request.user
    // console.log(user)
    return this.chapterService.create(createChapterDto,user);
  }
  
  @Get('course/:courseId')
  findAll(
    @Param('courseId',ParseIntPipe) courseId: number,
    @Query('page', new DefaultValuePipe(1),ParseIntPipe) page: number,
    @Query('chapterPerPage', new DefaultValuePipe(1),ParseIntPipe) chapterPerPage: number
  ) {
    console.log(typeof +courseId)
    console.log(typeof page)
    console.log(typeof chapterPerPage)
    console.log(page)
    console.log(chapterPerPage)
    return this.chapterService.findAll(+courseId,page,chapterPerPage);
  }

  @Roles(Role.ADMIN,Role.TEACHER,Role.STUDENT)
  @UseGuards(JwtAuthGuard,RolesGuard,ChapterAccessGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chapterService.findOne(+id);
  }
  
  @Roles(Role.ADMIN,Role.TEACHER)
  @UseGuards(JwtAuthGuard,RolesGuard,OwnershipGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChapterDto: UpdateChapterDto) {
    return this.chapterService.update(+id, updateChapterDto);
  }
  @Roles(Role.ADMIN,Role.TEACHER)
  @UseGuards(JwtAuthGuard,RolesGuard,OwnershipGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chapterService.remove(+id);
  }
}
