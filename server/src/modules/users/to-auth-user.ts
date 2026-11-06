import type { AuthUser } from '@kadai/shared';
import type { User } from './user.schema.js';

/** The only user details that leave the API. It's built field by field, so a new private field can't leak. */
export const toAuthUser = (user: Pick<User, '_id' | 'name' | 'email' | 'phone' | 'role'>): AuthUser => ({
  id: user._id,
  name: user.name,
  email: user.email,
  ...(user.phone && { phone: user.phone }),
  role: user.role,
});
