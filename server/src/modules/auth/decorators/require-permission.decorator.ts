import type { Permission } from '@kadai/shared';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Roles } from './roles.decorator.js';

export const PERMISSION_KEY = 'auth:permission';

/** Limits a route to admins whose staff role includes this permission. */
export const RequirePermission = (permission: Permission) =>
  applyDecorators(Roles('admin'), SetMetadata(PERMISSION_KEY, permission));
