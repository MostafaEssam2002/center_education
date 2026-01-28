import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }
  async register(createUserDto: CreateUserDto): Promise<any> {
  const existingUser = await this.prisma.user.findUnique({
    where: { email: createUserDto.email },
  });

  if (existingUser) {
    return {
      success: false,
      message: 'Email already exists',
    };
  }

  if (createUserDto.role === 'ADMIN') {
    return {
      success: false,
      message: 'Cannot register user with ADMIN role',
    };
  }

  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

  try {
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        age: createUserDto.age,
        phone: createUserDto.phone,
        address: createUserDto.address,
        image_path: createUserDto.image_path,
        role: Role.USER,
      },
    });

    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword,
    };
  } catch (error) {
    // حتى هنا ما نرميش Exception
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return {
        success: false,
        message: 'Email already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
}


  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          age: true,
          phone: true,
          address: true,
          role: true,
          image_path: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // async findByEmail(email: string) {
  //   const user =await this.prisma.user.findUnique({where:{email}});
  //   if  (!user){
  //     throw new BadRequestException('User not found');
  //   }
  //   return user;
  //   // return `This action returns a #${id} user`;
  // }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Email already exists');
        }
        if (error.code === 'P2025') {
          throw new BadRequestException('User not found');
        }
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
