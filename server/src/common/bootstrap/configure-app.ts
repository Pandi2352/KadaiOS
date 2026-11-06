import { type INestApplication, VersioningType } from '@nestjs/common';
import { API_PREFIX, API_VERSION } from '@kadai/shared';
import helmet from 'helmet';
import { buildCorsOptions } from '../../config/cors.config.js';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter.js';
import { ResponseInterceptor } from '../interceptors/response.interceptor.js';
import { createValidationPipe } from '../pipes/validation.pipe.js';
import { setupSwagger } from '../swagger/swagger.config.js';

/** Everything an app instance needs to behave like the real API. Tests use this too. */
export function configureApp(app: INestApplication, clientOrigins: string[], swaggerEnabled: boolean): void {
  app.use(
    helmet({
      // Swagger UI needs inline scripts. Docs are off in production, where the strict policy applies.
      contentSecurityPolicy: swaggerEnabled ? false : undefined,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.setGlobalPrefix(API_PREFIX);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: API_VERSION });
  app.enableCors(buildCorsOptions(clientOrigins));
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();

  if (swaggerEnabled) {
    setupSwagger(app);
  }
}
