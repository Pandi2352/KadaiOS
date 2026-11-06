import type { AuthRole } from '@kadai/shared';
import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FORBIDDEN_MESSAGE } from '../auth.constants.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { AuthenticatedRequest } from './authenticated-request.js';

/** Runs after AccessTokenGuard. A 403 means "logged in, but not allowed", so the client doesn't try to refresh. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<AuthRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user || !roles.includes(user.role)) throw new ForbiddenException(FORBIDDEN_MESSAGE);
    return true;
  }
}
