import type { ApiResponse } from '@kadai/shared';
import { ENV } from '@/config/env';
import { ApiError, NETWORK_ERROR_MESSAGE } from './ApiError';

type QueryValue = string | number | boolean | undefined;

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: object;
  signal?: AbortSignal;
}

function buildUrl(path: string, query: object = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query) as [string, QueryValue][]) {
    if (value !== undefined) params.set(key, String(value));
  }
  const search = params.toString();
  return `${ENV.apiUrl}${path}${search ? `?${search}` : ''}`;
}

const isApiResponse = (value: unknown): value is ApiResponse<unknown> =>
  typeof value === 'object' && value !== null && 'success' in value;

/** The one place that calls the API. Returns `data`, or throws ApiError. */
export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, query, signal }: ApiRequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError({ statusCode: 0, message: NETWORK_ERROR_MESSAGE });
  }

  const payload: unknown = await response.json().catch(() => null);

  // Anything else, such as the dev proxy's error page when the API is stopped, means the API didn't answer.
  if (!isApiResponse(payload)) {
    throw new ApiError({ statusCode: response.status, message: NETWORK_ERROR_MESSAGE });
  }
  if (!payload.success) {
    throw new ApiError(payload.error);
  }
  return payload.data as T;
}

export const api = {
  get: <T>(path: string, options?: Pick<ApiRequestOptions, 'query' | 'signal'>) => apiRequest<T>(path, options),
  post: <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};
