import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('MAIL_HOST'),
            port: this.configService.get('MAIL_PORT'),
            secure: this.configService.get('MAIL_PORT') === 465, // true for 465, false for other ports
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASS'),
            },
        });
    }

    async sendOtpEmail(to: string, otp: string) {
        const mailOptions = {
            from: `"Center Education" <${this.configService.get('MAIL_FROM')}>`,
            to: to,
            subject: 'Verification Code',
            text: `Your verification code is: ${otp}`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: #333; text-align: center;">Verification Code</h2>
          <p>Welcome to Center Education! Please use the following code to verify your identity:</p>
          <div style="font-size: 24px; font-weight: bold; color: #4CAF50; text-align: center; padding: 10px; background: #f9f9f9; border-radius: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
        </div>
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send verification email');
        }
    }
}
