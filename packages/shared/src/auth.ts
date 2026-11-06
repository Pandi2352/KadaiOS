export const AUTH_ROLES = ['admin', 'customer'] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export const PASSWORD_LIMITS = {
  min: 8,
  /** Stops very long passwords being used to tie up the server while hashing. */
  max: 128,
} as const;

export const EMAIL_MAX_LENGTH = 254;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AuthRole;
}

export interface AuthSession {
  accessToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
  phone?: string;
}
