import type { ApiResponse } from '@kadai/shared';
import { ApiError, NETWORK_ERROR_MESSAGE } from './ApiError';

type QueryValue = string | number | boolean | undefined;

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: object;
  signal?: AbortSignal;
}

export interface ApiClient {
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>;
  get: <T>(path: string, options?: Pick<ApiRequestOptions, 'query' | 'signal'>) => Promise<T>;
  post: <T>(path: string, body?: unknown) => Promise<T>;
  patch: <T>(path: string, body: unknown) => Promise<T>;
  put: <T>(path: string, body: unknown) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
  /** Sent with every request. Kept in memory only, so it isn't left behind in browser storage. */
  setAccessToken: (token: string | null) => void;
  /** Called when a request gets a 401. Resolves true if a new access token is ready. */
  setRefreshHandler: (handler: (() => Promise<boolean>) | null) => void;
  /** Requests wait for what this returns, so they don't go out before the session has loaded. */
  setRequestGate: (gate: (() => Promise<unknown> | null) | null) => void;
}

const UNAUTHORIZED = 401;
const AUTH_PATH_PREFIX = '/auth/';

function buildUrl(baseUrl: string, path: string, query: object = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query) as [string, QueryValue][]) {
    if (value !== undefined) params.set(key, String(value));
  }
  const search = params.toString();
  return `${baseUrl}${path}${search ? `?${search}` : ''}`;
}

const isApiResponse = (value: unknown): value is ApiResponse<unknown> =>
  typeof value === 'object' && value !== null && 'success' in value;

/** The one place that calls the API. Requests return `data`, or throw ApiError. */
export function createApiClient({ baseUrl }: { baseUrl: string }): ApiClient {
  let accessToken: string | null = null;
  let refreshHandler: (() => Promise<boolean>) | null = null;
  let requestGate: (() => Promise<unknown> | null) | null = null;

  const send = async <T>(path: string, options: ApiRequestOptions, canRetry: boolean): Promise<T> => {
    const { method = 'GET', body, query, signal } = options;
    const isAuthPath = path.startsWith(AUTH_PATH_PREFIX);

    // Auth requests are what the gate waits for, so they can't wait themselves.
    if (!isAuthPath) await requestGate?.();

    const headers: Record<string, string> = {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };

    let response: Response;
    try {
      response = await fetch(buildUrl(baseUrl, path, query), {
        method,
        signal,
        headers,
        credentials: 'include',
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      throw new ApiError({ statusCode: 0, message: NETWORK_ERROR_MESSAGE });
    }

    // An expired access token gets one refresh and one retry. Login's own 401 means wrong details, so it never retries.
    const isExpired = response.status === UNAUTHORIZED && canRetry && !isAuthPath;
    if (isExpired && refreshHandler && (await refreshHandler())) {
      return send<T>(path, options, false);
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
  };

  const request = <T>(path: string, options: ApiRequestOptions = {}) => send<T>(path, options, true);

  return {
    request,
    get: (path, options) => request(path, options),
    post: (path, body) => request(path, { method: 'POST', body }),
    patch: (path, body) => request(path, { method: 'PATCH', body }),
    put: (path, body) => request(path, { method: 'PUT', body }),
    delete: (path) => request(path, { method: 'DELETE' }),
    setAccessToken: (token) => {
      accessToken = token;
    },
    setRefreshHandler: (handler) => {
      refreshHandler = handler;
    },
    setRequestGate: (gate) => {
      requestGate = gate;
    },
  };
}
