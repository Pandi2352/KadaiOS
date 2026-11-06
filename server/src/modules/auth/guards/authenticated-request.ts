import type { AuthUser } from '@kadai/shared';
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  /** Set by AccessTokenGuard. Missing only on public routes. */
  user?: AuthUser;
}
