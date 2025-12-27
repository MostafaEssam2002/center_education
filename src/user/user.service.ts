import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
@Injectable()
export class UserService {
  constructor(private prisma:PrismaService){}
  async register(createUserDto: CreateUserDto): Promise<object> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    if(createUserDto.role === "ADMIN"){
      throw new BadRequestException('Cannot register user with ADMIN role');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password,10);
    try{
      const user = await this.prisma.user.create({data: {...createUserDto, password:hashedPassword}});
      const {password,...userWithoutPassword} =user ;
      return {message:'This action adds a new user',user:userWithoutPassword};
    }catch(error){
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { 
          throw new BadRequestException('Email already exists');
        }
  }
  throw new InternalServerErrorException(error.message);
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany(
      {
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
    }
  );
    return users;
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
