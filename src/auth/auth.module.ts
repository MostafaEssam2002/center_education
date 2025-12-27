import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule, // 🔴 مهم
    PassportModule,
    JwtModule.register({
      // secret: process.env.JWT_SECRET || 'SECRET_KEY',
      secret: process.env.JWT_SECRET ,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  // imports: [UserService],
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtStrategy,PrismaService],
})
export class AuthModule {}
