import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { setupSwagger, SWAGGER_PATH } from './common/swagger/swagger.config.js';
import type { AppConfig } from './config/app.config.js';
import { buildCorsOptions } from './config/cors.config.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.enableCors(buildCorsOptions(config.get('clientOrigins', { infer: true })));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const swaggerEnabled = config.get('swaggerEnabled', { infer: true });
  if (swaggerEnabled) {
    setupSwagger(app);
  }

  const port = config.get('port', { infer: true });
  await app.listen(port);
  logger.log(`API running on http://localhost:${port}/api`);
  if (swaggerEnabled) {
    logger.log(`API docs on http://localhost:${port}/${SWAGGER_PATH}`);
  }
}

void bootstrap();
