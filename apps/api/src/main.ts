import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggingService } from './modules/logging/logging.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { validateEnv } from './config/env.schema';

async function bootstrap() {
  // Validate environment variables before starting
  try {
    validateEnv();
  } catch (error: any) {
    console.error('❌ Environment validation failed:');
    console.error(error.message);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Get the logging service instance to use in global setup
  const loggingService = app.get(LoggingService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter(loggingService));

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Enable shutdown hooks
  app.enableShutdownHooks();

  // Setup Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('KN Biosciences API')
      .setDescription('Headless E-Commerce Platform API for KN Biosciences')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // Log application startup
  await loggingService.info(
    'KN Biosciences API started successfully',
    {
      module: 'AppBootstrap',
      port: process.env.PORT || 3000,
      environment: process.env.NODE_ENV || 'development',
    }
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();