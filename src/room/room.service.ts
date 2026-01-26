import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) { }
  private validateRoom(dto: Partial<CreateRoomDto>) {
    if (dto.type === 'ONLINE') {
      if (dto.capacity || dto.location) {
        throw new BadRequestException(
          'ONLINE room must not have capacity or location',
        );
      }
    }
    if (dto.type === 'OFFLINE') {
      if (!dto.capacity || !dto.location) {
        throw new BadRequestException(
          'OFFLINE room must have capacity and location',
        );
      }
    }
  }
  async create(dto: CreateRoomDto) {
    this.validateRoom(dto);

    return this.prisma.room.create({
      data: dto,
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.room.count({ where: { isActive: true } }),
    ]);

    return {
      data: rooms,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: number) {
    return this.prisma.room.findUnique({
      where: { id },
    });
  }

  async update(id: number, dto: UpdateRoomDto) {

    const room = await this.findOne(id);
    if (!room) throw new NotFoundException('Room not found');

    this.validateRoom(dto);

    return this.prisma.room.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const room = await this.findOne(id);
    if (!room) throw new NotFoundException('Room not found');

    // Soft delete
    return this.prisma.room.update({
      where: { id },
      data: { isActive: false },
    });
  }


}
