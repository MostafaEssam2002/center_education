import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
@Injectable()
export class PaymentsService {
  private TOKEN_FILE = path.join(process.cwd(), '.paymob_token.json');

  constructor(
    private prisma: PrismaService,
    private enrollmentService: EnrollmentService,
  ) { }

  /* ============================================================
     1️⃣ Auth Token (with file cache like your code)
  ============================================================ */
  private async getAuthToken(): Promise<string> {
    const apiKey = process.env.PAYMOB_API_KEY;
    if (!apiKey) {
      throw new BadRequestException('PAYMOB_API_KEY missing');
    }

    let cachedData: any = null;

    if (fs.existsSync(this.TOKEN_FILE)) {
      try {
        cachedData = JSON.parse(fs.readFileSync(this.TOKEN_FILE, 'utf8'));
      } catch { }
    }

    const now = Date.now();

    if (cachedData?.token && now < cachedData.expiry) {
      return cachedData.token;
    }

    const response = await axios.post(
      'https://accept.paymob.com/api/auth/tokens',
      { api_key: apiKey },
    );

    const token = response.data.token;
    const expiry = now + 50 * 60 * 1000; // 50 minutes

    fs.writeFileSync(
      this.TOKEN_FILE,
      JSON.stringify({ token, expiry }),
    );

    return token;
  }

  /* ============================================================
     2️⃣ Initiate Payment (Order + Payment Key + Redirect URL)
  ============================================================ */
  async initiatePayment(dto: CreatePaymentDto) {
    // 1️⃣ Fetch Enrollment Request with relations
    const enrollmentRequest = await this.prisma.enrollmentRequest.findUnique({
      where: { id: dto.enrollmentRequestId },
      include: {
        student: true,
        course: true,
      },
    });

    if (!enrollmentRequest) {
      throw new NotFoundException(
        `Enrollment request with ID ${dto.enrollmentRequestId} not found`,
      );
    }

    if (enrollmentRequest.status !== 'WAIT_FOR_PAY') {
      throw new BadRequestException(
        `Enrollment request status is ${enrollmentRequest.status}, expected WAIT_FOR_PAY`,
      );
    }

    // 2️⃣ Calculate amount (with discount if available)
    const priceBeforeDiscount = enrollmentRequest.course.price;
    const discount = enrollmentRequest.course.discount || 0;
    const finalPrice = priceBeforeDiscount - discount;
    const amount_cents = Math.round(finalPrice * 100);

    // 3️⃣ Prepare shipping data from student info
    const shipping_data = {
      first_name: enrollmentRequest.student.first_name || 'Student',
      last_name: enrollmentRequest.student.last_name || 'User',
      email: enrollmentRequest.student.email,
      phone_number: enrollmentRequest.student.phone || '01000000000',
      city: 'Cairo',
      country: 'EG',
      street: 'NA',
      building: 'NA',
      floor: 'NA',
      apartment: 'NA',
    };

    // 4️⃣ Prepare items
    const items = [
      {
        name: enrollmentRequest.course.title,
        amount_cents,
        description: enrollmentRequest.course.description || 'Course enrollment',
        quantity: 1,
      },
    ];

    const authToken = await this.getAuthToken();

    /* ---------- 5️⃣ Create Order ---------- */
    const orderRes = await axios.post(
      'https://accept.paymob.com/api/ecommerce/orders',
      {
        auth_token: authToken,
        api_source: 'INVOICE',
        amount_cents,
        currency: 'EGP',
        delivery_needed: false,
        items,
        shipping_data,
        integrations: dto.integration_id ? [dto.integration_id] : [],
      },
    );

    const orderId = orderRes.data.id;

    /* ---------- 6️⃣ Create or Update Payment Record in DB ---------- */
    // Check if payment already exists for this enrollment request
    const existingPayment = await this.prisma.payment.findUnique({
      where: { enrollmentRequestId: enrollmentRequest.id },
    });

    if (existingPayment) {
      // Update existing payment with new order ID
      await this.prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          paymobOrderId: orderId,
          status: 'PENDING',
          amountCents: amount_cents,
        },
      });
    } else {
      // Create new payment record
      await this.prisma.payment.create({
        data: {
          userId: enrollmentRequest.studentId,
          courseId: enrollmentRequest.courseId,
          enrollmentRequestId: enrollmentRequest.id,
          amountCents: amount_cents,
          status: 'PENDING',
          paymobOrderId: orderId,
        },
      });
    }

    /* ---------- 7️⃣ Create Payment Key ---------- */
    const paymentKeyRes = await axios.post(
      'https://accept.paymob.com/api/acceptance/payment_keys',
      {
        auth_token: authToken,
        amount_cents,
        expiration: 3600,
        order_id: orderId,
        currency: 'EGP',
        integration_id: dto.integration_id,
        billing_data: shipping_data,
      },
    );

    const paymentToken = paymentKeyRes.data.token;

    /* ---------- 8️⃣ Redirect Logic ---------- */
    let redirectUrl = '';

    if (
      String(dto.integration_id) ===
      String(process.env.WALLET_INTEGRATION_ID)
    ) {
      const walletRes = await axios.post(
        'https://accept.paymob.com/api/acceptance/payments/pay',
        {
          source: {
            identifier: dto.walletPhoneNumber || shipping_data.phone_number,
            subtype: 'WALLET',
          },
          payment_token: paymentToken,
        },
      );

      redirectUrl =
        walletRes.data.iframe_redirection_url || walletRes.data.url;
    } else {
      redirectUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.IFRAME_ID}?payment_token=${paymentToken}`;
    }

    return {
      orderId,
      paymentToken,
      redirectUrl,
      amount: finalPrice,
      currency: 'EGP',
    };
  }

  async handleWebhook(body: any, headers: any, query: any) {
    if (!body || !body.obj) {
      return { message: 'Invalid webhook payload' };
    }

    const obj = body.obj;

    /* ---------- 1️⃣ Get HMAC ---------- */
    const receivedHmac =
      headers['x-paymob-hmac'] || query.hmac;

    if (!receivedHmac) {
      throw new Error('Missing HMAC');
    }

    /* ---------- 2️⃣ Build String To Hash ---------- */
    const val = (v: any) =>
      v === null || v === undefined ? '' : String(v);

    const stringToHash =
      val(obj.amount_cents) +
      val(obj.created_at) +
      val(obj.currency) +
      val(obj.error_occured) +
      val(obj.has_parent_transaction) +
      val(obj.id) +
      val(obj.integration_id) +
      val(obj.is_3d_secure) +
      val(obj.is_auth) +
      val(obj.is_capture) +
      val(obj.is_refunded) +
      val(obj.is_standalone_payment) +
      val(obj.is_voided) +
      val(obj.order.id) +
      val(obj.owner) +
      val(obj.pending) +
      val(obj.source_data.pan) +
      val(obj.source_data.sub_type) +
      val(obj.source_data.type) +
      val(obj.success);

    /* ---------- 3️⃣ Calculate HMAC ---------- */
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (!hmacSecret) {
      throw new Error('PAYMOB_HMAC_SECRET is missing!');
    }

    const calculatedHmac = crypto
      .createHmac('sha512', hmacSecret)
      .update(stringToHash)
      .digest('hex');

    const isValid =
      calculatedHmac.length === receivedHmac.length &&
      crypto.timingSafeEqual(
        Buffer.from(calculatedHmac),
        Buffer.from(receivedHmac),
      );

    if (!isValid) {
      throw new Error('Invalid HMAC');
    }

    /* ---------- 4️⃣ Determine Payment Status ---------- */
    const isPaid =
      obj.success === true &&
      obj.pending === false &&
      obj.is_voided === false &&
      obj.is_refunded === false;

    /* ---------- 5️⃣ Find Payment Record ---------- */
    const payment = await this.prisma.payment.findFirst({
      where: { paymobOrderId: obj.order.id },
      include: {
        request: true,
      },
    });

    if (!payment) {
      console.warn(`⚠️ Payment not found for Paymob Order ID: ${obj.order.id}`);
      return { message: 'Payment not found' };
    }

    /* ---------- 6️⃣ Update Payment Status ---------- */
    if (isPaid) {
      console.log(
        `✅ PAYMENT SUCCESS | Order ${obj.order.id} | ${obj.amount_cents / 100} EGP`,
      );

      // Update payment status to PAID
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          transactionId: obj.id,
        },
      });

      // Confirm enrollment - this will create enrollment and delete request
      try {
        await this.enrollmentService.confirmPayment(
          payment.courseId,
          payment.userId,
        );
        console.log(
          `✅ Enrollment confirmed for student ${payment.userId} in course ${payment.courseId}`,
        );
      } catch (error) {
        console.error('❌ Error confirming enrollment:', error.message);
      }
    } else {
      console.log(`❌ PAYMENT FAILED | Order ${obj.order.id}`);

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          transactionId: obj.id,
        },
      });
    }

    /* ---------- 6️⃣ Optional Logging ---------- */
    fs.appendFileSync(
      'payments.log',
      `\n${new Date().toISOString()}\n${JSON.stringify(body, null, 2)}\n`,
    );

    return { message: 'OK' };
  }
}
