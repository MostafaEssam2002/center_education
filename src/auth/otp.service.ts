import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    async generateAndSendOtp(email: string, userId?: number) {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Save to DB (override existing OTP for this email)
        await this.prisma.otp.deleteMany({ where: { email } });
        await this.prisma.otp.create({
            data: {
                email,
                otp,
                expiresAt,
                userId,
            },
        });

        // Send email
        await this.mailService.sendOtpEmail(email, otp);
    }

    async verifyOtp(email: string, otp: string) {
        const otpRecord = await this.prisma.otp.findFirst({
            where: {
                email,
                otp,
                expiresAt: { gt: new Date() },
            },
        });

        if (!otpRecord) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        // Mark user as verified
        if (otpRecord.userId) {
            await this.prisma.user.update({
                where: { id: otpRecord.userId },
                data: { isVerified: true },
            });
        } else {
            // Fallback if userId is not saved, find by email
            await this.prisma.user.update({
                where: { email },
                data: { isVerified: true },
            });
        }

        // Delete the used OTP
        await this.prisma.otp.deleteMany({ where: { email } });

        return { message: 'Email verified successfully' };
    }
}
