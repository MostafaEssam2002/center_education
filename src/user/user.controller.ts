import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { OwnershipGuard } from 'src/auth/guards/ownership/ownership.guard';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userService.findAll(page ? +page : 1, limit ? +limit : 10);
  }

  @Get(':email')
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiParam({ name: 'email', type: String, description: 'User email' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updated = await this.userService.update(+id, updateUserDto);
    try {
      if (updateUserDto && (updateUserDto as any).lang) {
        if (updated && typeof updated === 'object') {
          (updated as any).lang = (updateUserDto as any).lang;
        }
      }
    } catch (err) {
      // ignore silently
    }

    return {
      data: updated,
      message: 'updated successfully',
      status: 1,
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
