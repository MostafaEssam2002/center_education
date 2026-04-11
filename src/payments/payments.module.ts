import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [HttpModule, ConfigModule, PrismaModule, EnrollmentModule, MailModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule { }
