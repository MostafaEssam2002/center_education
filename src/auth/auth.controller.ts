import { Controller, Get, HttpCode, Param, ParseIntPipe, Post, Request, UseGuards, Body } from '@nestjs/common';
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
    const result: any = await this.userService.register(createUserDto);
    const token = await this.authService.login(result.user);
    // console.log(result.user)
    return {
      message:result.message,
      data:{info:result.user, token:token.data.access_token},
    };
  }

  @Post("login")
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  async login(@Request() req) {
    // console.log('req.user = ', JSON.stringify(req.user, null, 2));

    // console.log(`req.user = ${req.user.password}`)
    return this.authService.login(req.user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  // @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.authService.findOne(id);
  }
  // @Get(':id')
  // @UseGuards(JwtAuthGuard, PoliciesGuard)
  // @CheckPolicies((ability) => ability.can('read', 'User'))
  // findOne(@Param('id') id: number) {
  //   return this.authService.findOne(id);
  // }

}
