import type { AuthRole } from '@kadai/shared';
import { applyDecorators, HttpStatus, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { errorResponse } from '../../../common/swagger/api-endpoint.decorator.js';
import { FORBIDDEN_MESSAGE, LOGIN_REQUIRED_MESSAGE } from '../auth.constants.js';

export const ROLES_KEY = 'auth:roles';

/**
 * Limits a route or controller to these roles, and documents the login in Swagger.
 * With no roles, any logged-in user can use it.
 */
export const Roles = (...roles: AuthRole[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    ApiBearerAuth(),
    errorResponse(HttpStatus.UNAUTHORIZED, 'Not logged in, or the session has expired', LOGIN_REQUIRED_MESSAGE),
    ...(roles.length > 0
      ? [errorResponse(HttpStatus.FORBIDDEN, `Only for: ${roles.join(', ')}`, FORBIDDEN_MESSAGE)]
      : []),
  );
