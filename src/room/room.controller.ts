import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { CreateRoomDto } from "./dto/create-room.dto";
import { RoomService } from "./room.service";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles/roles.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) { }
  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateRoomDto) {
    return this.roomService.create(dto);
  }

  @Get()
  @Roles('ADMIN', 'EMPLOYEE', 'TEACHER')
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'EMPLOYEE', 'TEACHER')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.remove(id);
  }
}
