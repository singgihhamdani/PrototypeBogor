import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Prefix Global API
  app.setGlobalPrefix('api/v1');

  // 2. CORS Policy
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://sijakon.bogorkab.go.id',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 3. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 4. OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('SIJAKON BOGOR — API Specification')
    .setDescription(
      'Spesifikasi REST API Sistem Informasi Pembinaan & Pengawasan Jasa Konstruksi Kabupaten Bogor (TA 2026)',
    )
    .setVersion('1.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Masukkan token JWT akses Anda',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 SIJAKON Backend API running on: http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger API Docs available on: http://localhost:${port}/api/docs`);
}

bootstrap();
