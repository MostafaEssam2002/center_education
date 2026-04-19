import { Controller, Get, HttpCode, Param, ParseIntPipe, Post, Request, UseGuards, Body, Query, DefaultValuePipe, BadRequestException, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
import { OwnershipGuard } from './guards/ownership/ownership.guard';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { OtpService } from './otp.service';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly otpService: OtpService
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered. Please verify your email.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      console.log('AuthController.register started for:', createUserDto.email);
      const result = await this.userService.register(createUserDto);

      try {
        // Generate and send OTP
        console.log('Generating OTP for:', result.user.id);
        await this.otpService.generateAndSendOtp(createUserDto.email, result.user.id);
        console.log('OTP sent successfully');
      } catch (otpError) {
        console.error('Failed to send OTP:', otpError.message);
        return {
          status: 1,
          message: 'تم التسجيل بنجاح، ولكن فشل إرسال كود التحقق. يمكنك تفعيله لاحقاً.',
          data: {
            user: result.user,
            otpError: otpError.message
          }
        };
      }

      return {
        status: 1,
        message: 'Registration successful. Please check your email for verification code.',
        data: {
          user: result.user,
        }
      };
    } catch (e) {
      console.error('Registration failed:', e.message);
      return {
        status: 0,
        message: e.message,
        data: null,
      };
    }
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
  async verifyOtp(@Body() body: { email: string, otp: string }) {
    try {
      const result = await this.otpService.verifyOtp(body.email, body.otp);

      // Optionally login the user automatically after verification
      const user = await this.userService.findByEmail(body.email);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const token = await this.authService.login(user as any);

      return {
        status: 1,
        message: result.message,
        data: {
          user,
          access_token: token.data.access_token,
        }
      };
    } catch (e) {
      return {
        status: 0,
        message: e.message,
        data: null,
      };
    }
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Logged in successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    try {
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        return {
          status: 0,
          message: "invalid credentials",
        };
      }
      const result = await this.authService.login(user as any);
      const token = result?.data?.access_token;
      if (token) {
        res.cookie('authToken', token, {
          httpOnly: true,
          sameSite: 'lax',
        });
      }
      return result;
    } catch (e) {
      // هنا بنمنع 400 ونخليه 200
      return {
        status: 0,
        message:
          e?.response?.message ||
          e?.message ||
          "Something went wrong",
        data: null,
      };
    }
  }

  @Get("users")
  @Roles(Role.ADMIN, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin/Teacher only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.authService.findAll(page, limit);
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by ID (Admin only)' })
  @ApiQuery({ name: 'id', required: true, type: Number })
  findOne(@Query('id', ParseIntPipe) id: number) {
    return this.authService.findOne(id);
  }
}
