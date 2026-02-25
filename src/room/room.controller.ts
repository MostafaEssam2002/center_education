import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, Query, DefaultValuePipe } from "@nestjs/common";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { CreateRoomDto } from "./dto/create-room.dto";
import { RoomService } from "./room.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles/roles.guard";
import { Role } from "@prisma/client";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) { }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new room (Admin only)' })
  @ApiResponse({ status: 201, description: 'Room successfully created.' })
  create(@Body() dto: CreateRoomDto) {
    return this.roomService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TEACHER)
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.roomService.findAll(page, limit);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TEACHER)
  @ApiOperation({ summary: 'Get a specific room by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a room (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a room (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.remove(id);
  }
}
