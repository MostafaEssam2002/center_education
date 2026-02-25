import { Body, Controller, Post, Headers, Req, Get, Query, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

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
