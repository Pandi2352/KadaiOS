import { API_PREFIX, API_VERSION } from '@kadai/shared';

export const ENV = {
  apiUrl: import.meta.env.VITE_API_URL ?? `/${API_PREFIX}/v${API_VERSION}`,
} as const;
