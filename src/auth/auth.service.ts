// import { Injectable } from '@nestjs/common';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
// import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService, private prisma: PrismaService) { }
  async validateUser(email: string, pass: string) {
    console.log('Attempting to validate user:', email);
    const user = await this.userService.findByEmail(email);

    if (!user) {
      console.log('User not found in DB:', email);
      return null;
    }

    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(pass, passwordHash);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return null;
    }

    // Check if user is verified
    if (!(user as any).isVerified) {
      console.log('User found but not verified:', email);
      throw new BadRequestException('الرجاء التأكد من حسابك عبر البريد الإلكتروني أولاً.');
    }

    // شيل الباسورد قبل الإرجاع
    const { password, ...result } = user;
    console.log('User validated successfully:', email);
    return result;
  }

  async login(user: { id: number, email: string, role: string }) {
    console.log('req.user = ', JSON.stringify(user, null, 2));
    const payload = { email: user.email, role: user.role, sub: user.id };
    console.log(payload)
    return {
      message: "login successfully",
      status: 1,
      data:
      {
        user: user,
        access_token: this.jwtService.sign(payload)
      },
    };
  }
  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const users = await this.prisma.user.findMany({
      skip,
      take: limit,
    });
    console.log("find all function in auth service called");
    return {
      data: users,
      meta: {
        page,
        limit,
        total: await this.prisma.user.count(),
      }
    };
  }
  async findOne(id: number) {
    // _________/\______________
    
    // return this.prisma.user.findUnique({
    //   where: { id },
    // });

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      return {
        status: 0,
        message: 'User not found',
        data: null,
      };
    }
    return {
      status: 1,
      message: 'retrieved successfully',
      data: user,
    };
  }

}
