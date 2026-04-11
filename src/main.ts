import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PaymentsService } from './payments/payments.service';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'public'));
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Center Education API')
    .setDescription('API documentation for available endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 3000, '0.0.0.0');

  // Run monthly billing job once at startup and once every 24 hours.
  try {
    const paymentsService = app.get(PaymentsService);

    const runMonthlyJob = async () => {
      try {
        const result = await paymentsService.runMonthlyBillingJob();
        console.log('Monthly billing job:', result);
      } catch (err) {
        console.error('Error running monthly billing job:', err);
      }
    };

    await runMonthlyJob();
    setInterval(runMonthlyJob, 24 * 60 * 60 * 1000);
  } catch (err) {
    console.warn('PaymentsService not available for monthly billing job:', err.message || err);
  }
}
bootstrap();