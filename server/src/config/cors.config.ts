import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js';

/** `*` allows every origin. Browsers reject `*` on credentialed requests, so list origins before using cookies. */
export const buildCorsOptions = (origins: string[]): CorsOptions => ({
  origin: origins.includes('*') ? '*' : origins,
});
