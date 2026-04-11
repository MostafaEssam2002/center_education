import { Body, Controller, Post, Headers, Req, Get, Query, Res, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateMonthlySubscriptionDto } from './dto/create-monthly-subscription.dto';
import { MarkMonthlySubscriptionPaidDto } from './dto/mark-monthly-subscription-paid.dto';
import { SendMonthlyReminderDto } from './dto/send-monthly-reminder.dto';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a payment' })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully.' })
  initiate(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.initiatePayment(dto);
  }

  @Post('monthly/generate')
  @ApiOperation({ summary: 'Generate monthly subscription records for enrolled students' })
  createMonthlySubscriptions(@Body() dto: CreateMonthlySubscriptionDto) {
    return this.paymentsService.createMonthlySubscriptions(dto);
  }

  @Post('monthly/generate/all')
  @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate monthly subscription records for all monthly courses' })
  generateMonthlySubscriptionsForAll(@Body() body: { month?: number; year?: number }) {
    return this.paymentsService.generateMonthlySubscriptionsForAllCourses(
      body.month,
      body.year,
    );
  }

  @Get('monthly/my')
  @Roles(Role.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get logged-in student monthly subscription records' })
  getMyMonthlySubscriptions(
    @Req() request: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const studentId = request.user.id;
    const monthNumber = month ? Number(month) : undefined;
    const yearNumber = year ? Number(year) : undefined;

    return this.paymentsService.getMonthlySubscriptionsForStudent(
      studentId,
      monthNumber,
      yearNumber,
    );
  }

  @Get('monthly/course/:courseId')
  @ApiOperation({ summary: 'Get monthly subscription status for a course' })
  getMonthlySubscriptionsForCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.paymentsService.getMonthlySubscriptionsForCourse(
      courseId,
      month,
      year,
    );
  }

  @Post('monthly/:id/pay')
  @ApiOperation({ summary: 'Mark a monthly subscription as paid' })
  markMonthlySubscriptionPaid(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarkMonthlySubscriptionPaidDto,
  ) {
    return this.paymentsService.markMonthlySubscriptionPaid(id, dto);
  }

  @Post('monthly/remind')
  @ApiOperation({ summary: 'Send payment reminders to unpaid students' })
  sendMonthlyReminder(@Body() dto: SendMonthlyReminderDto) {
    return this.paymentsService.sendMonthlyReminder(dto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Paymob Webhook endpoint' })
  handleWebhook(
    @Body() body: any,
    @Headers() headers: any,
    @Req() req: any,
  ) {
    return this.paymentsService.handleWebhook(body, headers, req.query);
  }

  @Get('success')
  @ApiOperation({ summary: 'Payment success callback' })
  @ApiQuery({ name: 'success', type: String })
  @ApiQuery({ name: 'order', type: String })
  paymentSuccess(@Query() query: any, @Res() res: Response) {
    // Get payment status from query parameters
    const success = query.success === 'true';
    const orderId = query.order;

    // Get frontend URL from environment or use default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Redirect to frontend with payment status
    const status = success ? 'success' : 'failed';
    const redirectUrl = `${frontendUrl}/pending-payments?payment=${status}&order=${orderId}`;

    return res.redirect(redirectUrl);
  }
}
