import { hasPermission, type Permission } from '@kadai/shared';
import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FORBIDDEN_MESSAGE } from '../auth.constants.js';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator.js';
import type { AuthenticatedRequest } from './authenticated-request.js';

/**
 * Runs after RolesGuard. The user comes from the database on every request,
 * so a role change applies straight away, not when the token expires.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<Permission | undefined>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permission) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!hasPermission(user, permission)) throw new ForbiddenException(FORBIDDEN_MESSAGE);
    return true;
  }
}
