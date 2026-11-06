import { API_PREFIX, API_VERSION, type AuthRole } from '@kadai/shared';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** A replaced token seen again this soon is a browser that lost the reply, such as a reload, not theft. */
export const REFRESH_REUSE_GRACE_MS = 10 * 1000;

export const JWT_ISSUER = 'kadai-os';

export const LOGIN_REQUIRED_MESSAGE = 'Log in to continue.';
export const FORBIDDEN_MESSAGE = "You don't have permission to do this.";

/** One cookie per role with its own path: localhost cookies are shared across ports. */
export const refreshCookieName = (role: AuthRole) => `kadai_${role}_refresh`;
export const refreshCookiePath = (role: AuthRole) => `/${API_PREFIX}/v${API_VERSION}/auth/${role}`;
