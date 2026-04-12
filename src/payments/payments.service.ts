import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { MailService } from 'src/mail/mail.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateMonthlySubscriptionDto } from './dto/create-monthly-subscription.dto';
import { MarkMonthlySubscriptionPaidDto } from './dto/mark-monthly-subscription-paid.dto';
import { SendMonthlyReminderDto } from './dto/send-monthly-reminder.dto';
@Injectable()
export class PaymentsService {
  private TOKEN_FILE = path.join(process.cwd(), '.paymob_token.json');

  constructor(
    private prisma: PrismaService,
    private enrollmentService: EnrollmentService,
    private mailService: MailService,
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
    const basePrice = enrollmentRequest.course.paymentType === 'MONTHLY' 
      ? (enrollmentRequest.course.monthlyPrice || 0) 
      : enrollmentRequest.course.price;
    const discount = enrollmentRequest.course.discount || 0;
    const finalPrice = basePrice - discount;
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

  async createMonthlySubscriptions(dto: CreateMonthlySubscriptionDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course ${dto.courseId} not found`);
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId: dto.courseId },
    });

    if (!enrollments.length) {
      return {
        message: 'No enrolled students found for this course',
        courseId: dto.courseId,
        month: dto.month,
        year: dto.year,
      };
    }

    const dueDate = new Date(Date.UTC(dto.year, dto.month - 1, 1));
    const created: number[] = [];
    const skipped: number[] = [];

    for (const enrollment of enrollments) {
      const existing = await this.prisma.monthlySubscription.findUnique({
        where: {
          unique_monthly_subscription: {
            courseId: dto.courseId,
            studentId: enrollment.studentId,
            month: dto.month,
            year: dto.year,
          },
        },
      });

      if (existing) {
        if (existing.status !== 'PAID') {
          await this.prisma.monthlySubscription.update({
            where: { id: existing.id },
            data: {
              amountCents: dto.amountCents,
              dueDate,
              status: 'PENDING',
            },
          });
        }
        skipped.push(enrollment.studentId);
      } else {
        await this.prisma.monthlySubscription.create({
          data: {
            courseId: dto.courseId,
            studentId: enrollment.studentId,
            month: dto.month,
            year: dto.year,
            amountCents: dto.amountCents,
            dueDate,
            status: 'PENDING',
          },
        });
        created.push(enrollment.studentId);
      }
    }

    return {
      message: 'Monthly subscription records generated',
      courseId: dto.courseId,
      month: dto.month,
      year: dto.year,
      created: created.length,
      skipped: skipped.length,
    };
  }

  private lastGeneratedMonth = 0;
  private lastGeneratedYear = 0;

  async generateMonthlySubscriptionsForAllCourses(month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const courses = await this.prisma.course.findMany({
      where: { paymentType: 'MONTHLY' },
    });

    if (!courses.length) {
      return {
        message: 'No monthly subscription courses found',
        month: targetMonth,
        year: targetYear,
        totalCourses: 0,
      };
    }

    const details = [] as any[];
    for (const course of courses) {
      if (!course.monthlyPrice || course.monthlyPrice <= 0) {
        continue;
      }

      const result = await this.createMonthlySubscriptions({
        courseId: course.id,
        month: targetMonth,
        year: targetYear,
        amountCents: Math.round(course.monthlyPrice * 100),
      });

      details.push({ courseId: course.id, result });
    }

    this.lastGeneratedMonth = targetMonth;
    this.lastGeneratedYear = targetYear;

    return {
      message: 'Monthly subscriptions generated for all monthly courses',
      month: targetMonth,
      year: targetYear,
      totalCourses: details.length,
      details,
    };
  }

  async runMonthlyBillingJob() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    if (this.lastGeneratedMonth === month && this.lastGeneratedYear === year) {
      return {
        message: 'Monthly billing already generated this month',
        month,
        year,
      };
    }

    const generationResult = await this.generateMonthlySubscriptionsForAllCourses(month, year);
    return generationResult;
  }

  async getMonthlySubscriptionsForStudent(
    studentId: number,
    month?: number,
    year?: number,
  ) {
    const where: any = { studentId };
    if (month) where.month = month;
    if (year) where.year = year;

    return this.prisma.monthlySubscription.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            paymentType: true,
            monthlyPrice: true,
          },
        },
      },
      orderBy: { year: 'desc', month: 'desc' },
    });
  }

  async getMonthlySubscriptionsForCourse(
    courseId: number,
    month: number,
    year: number,
  ) {
    const subscriptions = await this.prisma.monthlySubscription.findMany({
      where: {
        courseId,
        month,
        year,
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        studentId: 'asc',
      },
    });

    const enrollmentRecords = await this.prisma.enrollment.findMany({
      where: { courseId },
      select: { studentId: true },
    });

    const subscriptionMap = new Map(subscriptions.map((sub) => [sub.studentId, sub]));
    const fromDate = new Date(year, month - 1, 1);
    const toDate = new Date(year, month, 1);

    for (const enrollment of enrollmentRecords) {
      const existing = subscriptionMap.get(enrollment.studentId);

      const paidPayment = await this.prisma.payment.findFirst({
        where: {
          courseId,
          userId: enrollment.studentId,
          status: 'PAID',
          createdAt: {
            gte: fromDate,
            lt: toDate,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!existing && paidPayment) {
        const newSub = await this.prisma.monthlySubscription.create({
          data: {
            courseId,
            studentId: enrollment.studentId,
            month,
            year,
            amountCents: paidPayment.amountCents,
            dueDate: fromDate,
            status: 'PAID',
            paidAt: paidPayment.createdAt,
            transactionId: paidPayment.transactionId || undefined,
          },
          include: {
            student: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                phone: true,
              },
            },
          },
        });

        subscriptionMap.set(enrollment.studentId, newSub);
        subscriptions.push(newSub);
        continue;
      }

      if (existing && existing.status !== 'PAID' && paidPayment) {
        const updated = await this.prisma.monthlySubscription.update({
          where: { id: existing.id },
          data: {
            status: 'PAID',
            paidAt: paidPayment.createdAt,
            transactionId: paidPayment.transactionId || existing.transactionId,
          },
          include: {
            student: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                phone: true,
              },
            },
          },
        });

        subscriptionMap.set(enrollment.studentId, updated);
        const ix = subscriptions.findIndex((s) => s.id === existing.id);
        if (ix >= 0) subscriptions[ix] = updated;
      }
    }

    return subscriptions;
  }

  async markMonthlySubscriptionPaid(
    subscriptionId: number,
    dto: MarkMonthlySubscriptionPaidDto,
  ) {
    const subscription = await this.prisma.monthlySubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Monthly subscription ${subscriptionId} not found`,
      );
    }

    return this.prisma.monthlySubscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'PAID',
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
        transactionId: dto.transactionId,
      },
    });
  }

  async getMonthlySubscriptionAdminReport(month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const subscriptions = await this.prisma.monthlySubscription.findMany({
      where: {
        month: targetMonth,
        year: targetYear,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            monthlyPrice: true,
            teacher: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        courseId: 'asc',
      },
    });

    const teacherCount = await this.prisma.user.count({
      where: { role: 'TEACHER' },
    });
    const employeeCount = await this.prisma.user.count({
      where: { role: 'EMPLOYEE' },
    });
    const assistantCount = await this.prisma.user.count({
      where: { role: 'ASSISTANT' },
    });

    const paidCount = subscriptions.filter((sub) => sub.status === 'PAID').length;
    const pendingCount = subscriptions.filter((sub) => sub.status === 'PENDING').length;
    const overdueCount = subscriptions.filter((sub) => sub.status === 'OVERDUE').length;
    const totalAmountCents = subscriptions.reduce(
      (sum, sub) => sum + sub.amountCents,
      0,
    );
    const paidAmountCents = subscriptions.reduce(
      (sum, sub) => (sub.status === 'PAID' ? sum + sub.amountCents : sum),
      0,
    );

    const courseSummaries = [] as Array<{
      courseId: number;
      title: string;
      teacherName: string;
      totalSubscriptions: number;
      paidCount: number;
      pendingCount: number;
      overdueCount: number;
      collectedAmountCents: number;
      expectedMonthlyPriceCents?: number;
    }>;

    const courseMap = new Map<number, typeof courseSummaries[number]>();
    subscriptions.forEach((subscription) => {
      const courseId = subscription.courseId;
      const courseTitle = subscription.course.title;
      const teacher = subscription.course.teacher;
      const teacherName = teacher ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() : 'غير محدد';
      const existing = courseMap.get(courseId);
      if (!existing) {
        courseMap.set(courseId, {
          courseId,
          title: courseTitle,
          teacherName,
          totalSubscriptions: 0,
          paidCount: 0,
          pendingCount: 0,
          overdueCount: 0,
          collectedAmountCents: 0,
          expectedMonthlyPriceCents: subscription.course.monthlyPrice ? Math.round(subscription.course.monthlyPrice * 100) : undefined,
        });
      }

      const courseSummary = courseMap.get(courseId)!;
      courseSummary.totalSubscriptions += 1;
      courseSummary.collectedAmountCents += subscription.amountCents;
      if (subscription.status === 'PAID') {
        courseSummary.paidCount += 1;
      } else if (subscription.status === 'PENDING') {
        courseSummary.pendingCount += 1;
      } else if (subscription.status === 'OVERDUE') {
        courseSummary.overdueCount += 1;
      }
    });

    courseMap.forEach((summary) => courseSummaries.push(summary));

    const subscriptionsData = subscriptions.map((sub) => ({
      id: sub.id,
      courseId: sub.courseId,
      courseTitle: sub.course.title,
      teacherName: sub.course.teacher
        ? `${sub.course.teacher.first_name || ''} ${sub.course.teacher.last_name || ''}`.trim()
        : 'غير محدد',
      studentId: sub.student.id,
      studentName: `${sub.student.first_name || '-'} ${sub.student.last_name || '-'}`.trim(),
      studentEmail: sub.student.email,
      studentPhone: sub.student.phone,
      status: sub.status,
      amountCents: sub.amountCents,
      dueDate: sub.dueDate,
      paidAt: sub.paidAt,
      transactionId: sub.transactionId,
      createdAt: sub.createdAt,
    }));

    return {
      month: targetMonth,
      year: targetYear,
      totalSubscriptions: subscriptions.length,
      paidCount,
      pendingCount,
      overdueCount,
      totalAmountCents,
      paidAmountCents,
      teacherCount,
      employeeCount,
      assistantCount,
      courseSummaries,
      subscriptions: subscriptionsData,
    };
  }

  async sendMonthlyReminder(dto: SendMonthlyReminderDto) {
    const pendingSubscriptions = await this.prisma.monthlySubscription.findMany({
      where: {
        courseId: dto.courseId,
        month: dto.month,
        year: dto.year,
        status: 'PENDING',
      },
      include: {
        student: true,
        course: true,
      },
    });

    if (!pendingSubscriptions.length) {
      return {
        message: 'No unpaid monthly subscriptions found for this course/month',
        courseId: dto.courseId,
        month: dto.month,
        year: dto.year,
      };
    }

    const sendPromises = pendingSubscriptions.map((subscription) => {
      const student = subscription.student;
      return this.mailService.sendReminderEmail(
        student.email,
        subscription.course.title,
        dto.month,
        dto.year,
        subscription.amountCents / 100,
      );
    });

    await Promise.allSettled(sendPromises);

    return {
      message: 'Reminder emails sent to unpaid students',
      totalUnpaid: pendingSubscriptions.length,
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

      // If course is monthly subscription, create or update monthly subscription for current month irrespective of enrollment confirmation status
      try {
        const course = await this.prisma.course.findUnique({
          where: { id: payment.courseId },
        });
        if (course && course.paymentType === 'MONTHLY') {
          const now = new Date();
          const currentMonth = now.getMonth() + 1; // getMonth() is 0-based
          const currentYear = now.getFullYear();
          const dueDate = new Date(currentYear, currentMonth - 1, 1); // First day of current month

          // Check if subscription already exists for this month
          const existingSubscription = await this.prisma.monthlySubscription.findUnique({
            where: {
              unique_monthly_subscription: {
                courseId: payment.courseId,
                studentId: payment.userId,
                month: currentMonth,
                year: currentYear,
              },
            },
          });

          if (existingSubscription) {
            // Update existing subscription to PAID
            await this.prisma.monthlySubscription.update({
              where: { id: existingSubscription.id },
              data: {
                status: 'PAID',
                paidAt: now,
                transactionId: obj.id.toString(),
              },
            });
            console.log(
              `✅ Monthly subscription updated to PAID for student ${payment.userId} in course ${payment.courseId} for ${currentMonth}/${currentYear}`,
            );
          } else {
            // Create new subscription
            await this.prisma.monthlySubscription.create({
              data: {
                courseId: payment.courseId,
                studentId: payment.userId,
                month: currentMonth,
                year: currentYear,
                amountCents: obj.amount_cents,
                dueDate,
                status: 'PAID',
                paidAt: now,
                transactionId: obj.id.toString(),
              },
            });
            console.log(
              `✅ Monthly subscription created for student ${payment.userId} in course ${payment.courseId} for ${currentMonth}/${currentYear}`,
            );
          }
        }
      } catch (error) {
        console.error('❌ Error creating/updating monthly subscription:', error.message);
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
