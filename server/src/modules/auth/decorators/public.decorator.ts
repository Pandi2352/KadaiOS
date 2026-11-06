import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'auth:isPublic';

/** Opens a route or controller to everyone. Every other route needs a login. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
