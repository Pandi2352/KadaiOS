import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'api/docs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('KadaiOS API')
    .setDescription(
      'API for KadaiOS, software for small local shops. Successful responses return `{ success: true, data }`. Errors return `{ success: false, error: { statusCode, message } }`.',
    )
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    customSiteTitle: 'KadaiOS API Docs',
  });
}
