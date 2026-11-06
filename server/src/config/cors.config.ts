import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js';

/** Browsers reject `*` on requests with cookies, so credentials are only allowed with a listed origin. */
export const buildCorsOptions = (origins: string[]): CorsOptions =>
  origins.includes('*') ? { origin: '*' } : { origin: origins, credentials: true };
