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

export interface UserProfile extends AuthUser {
  createdAt: string;
}

export interface UpdateProfileInput {
  name: string;
  /** Leave out or send empty to remove it. */
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailInput {
  email: string;
  currentPassword: string;
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

export const ADMIN_INVITE_STATUSES = ['pending', 'accepted', 'expired'] as const;

export type AdminInviteStatus = (typeof ADMIN_INVITE_STATUSES)[number];

export interface AdminInvite {
  id: string;
  email: string;
  invitedBy: string;
  invitedByName?: string;
  status: AdminInviteStatus;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface CreateAdminInviteInput {
  email: string;
}

export interface AcceptAdminInviteInput {
  token: string;
  name: string;
  password: string;
  phone?: string;
}

export interface ValidateAdminInviteResponse {
  email: string;
  valid: boolean;
}
