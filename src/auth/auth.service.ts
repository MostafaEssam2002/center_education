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
  constructor(private userService: UserService,private jwtService: JwtService,private prisma: PrismaService) {}
  async validateUser(email: string, pass: string) {
    // حاول تجيب المستخدم (من غير أي throw)
    const user = await this.userService.findByEmail(email);
    // hash ثابت علشان منع timing attack
    const fakeHash =
      '$2b$10$CwTycUXWue0Thq9StjUM0uJ8hQ8K/uxyW6k8fV2J7p1u9E5Dq4q6';
    // دايمًا اعمل compare سواء user موجود أو لا
    const passwordHash = user ? user.password : fakeHash;
    const isPasswordValid = await bcrypt.compare(pass, passwordHash);
    // أي فشل → null (من غير كشف السبب)
    if (!user || !isPasswordValid) {
      return null;
    }
    // شيل الباسورد قبل الإرجاع
    const { password, ...result } = user;
    console.log(`the result =  ${result}`)
    return result;
  }

  async login(user:{id:number,email:string,role:string}) {
    console.log('req.user = ', JSON.stringify(user, null, 2));
    const payload = { email: user.email,role:user.role ,sub: user.id };
        console.log(payload)
        return {
          message:"login successfully",
          data:
          {
            user:user,
            access_token: this.jwtService.sign(payload)
          },
        };
  }
  async findAll() {
    const users = await this.prisma.user.findMany();
    console.log("find all function in auth service called");
    return users
  }
  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

}
