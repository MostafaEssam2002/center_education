import { Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
import { OwnershipGuard } from './guards/ownership/ownership.guard';
// import { PoliciesGuard } from './guards/policies/policies.guard';
// import { CheckPolicies } from './decorators/policies.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get()
  @Roles(Role.ADMIN,Role.TEACHER)
  @UseGuards(JwtAuthGuard,RolesGuard)
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  // @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return  this.authService.findOne(id);
  }
  // @Get(':id')
  // @UseGuards(JwtAuthGuard, PoliciesGuard)
  // @CheckPolicies((ability) => ability.can('read', 'User'))
  // findOne(@Param('id') id: number) {
  //   return this.authService.findOne(id);
  // }

}
