import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './common/bootstrap/configure-app.js';
import { describeStartupError } from './common/bootstrap/startup-error.js';
import { SWAGGER_PATH } from './common/swagger/swagger.config.js';
import type { AppConfig } from './config/app.config.js';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);

  configureApp(
    app,
    config.getOrThrow('clientOrigins', { infer: true }),
    config.getOrThrow('swaggerEnabled', { infer: true }),
  );

  const port = config.getOrThrow('port', { infer: true });
  await app.listen(port);
  logger.log(`API running on http://localhost:${port}/api`);
  if (config.getOrThrow('swaggerEnabled', { infer: true })) {
    logger.log(`API docs on http://localhost:${port}/${SWAGGER_PATH}`);
  }
}

bootstrap().catch((error: unknown) => {
  logger.error(describeStartupError(error));
  process.exit(1);
});
