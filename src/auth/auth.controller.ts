import { Controller, Get, HttpCode, Param, ParseIntPipe, Post, Request, UseGuards, Body, Query, DefaultValuePipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
import { OwnershipGuard } from './guards/ownership/ownership.guard';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.register(createUserDto);

    // ⛔ لو فشل، رجّع على طول
    if (!result.success) {
      return {
        status: 0,
        message: result.message,
        data: null,
      };
    }

    // ✅ هنا بس user موجود
    const token = await this.authService.login(result.user);

    return {
      message: result.message,
      data: {
        user: result.user,
        access_token: token.data.access_token,
      },
      status: 1
    };
  }


  @Post("login")
  @HttpCode(200)
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      return {
        status: 200,
        message: "invalid credentials",
      };
    }
    return this.authService.login(user as any);
  }

  @Get("users")
  @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.authService.findAll(page, limit);
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  findOne(@Query('id', ParseIntPipe) id: number) {
    console.log("this is id number fron query")
    return this.authService.findOne(id);
  }

}
