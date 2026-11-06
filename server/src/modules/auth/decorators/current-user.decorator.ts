import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from '../guards/authenticated-request.js';

/** The logged-in user, for routes the guards protect. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
