import type { AuthRole, AuthSession, AuthUser, LoginInput, RegisterInput } from '@kadai/shared';
import type { ApiClient } from '../api/createApiClient';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
}

export interface AuthClient {
  getState: () => AuthState;
  subscribe: (listener: () => void) => () => void;
  /** Restores the session from the refresh cookie when the app loads. */
  restore: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  /** Only the customer site calls this. The API has no admin registration route. */
  register: (input: RegisterInput) => Promise<void>;
  /** Throws if the server couldn't be reached, because the session would still be alive. */
  logout: () => Promise<void>;
}

/** Each refresh token works once, so tabs take turns. The later tab sends the newest cookie. */
const withTabLock = <T>(name: string, work: () => Promise<T>): Promise<T> =>
  typeof navigator !== 'undefined' && navigator.locks ? navigator.locks.request(name, work) : work();

export function createAuthClient({ api, role }: { api: ApiClient; role: AuthRole }): AuthClient {
  const basePath = `/auth/${role}`;
  const listeners = new Set<() => void>();
  let state: AuthState = { status: 'loading', user: null };
  let refreshing: Promise<boolean> | null = null;

  const setState = (next: AuthState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };

  const applySession = (session: AuthSession | null) => {
    api.setAccessToken(session?.accessToken ?? null);
    setState(session ? { status: 'authenticated', user: session.user } : { status: 'anonymous', user: null });
  };

  /** Requests that arrive during a refresh share it, so one token is never sent twice. */
  const refresh = (): Promise<boolean> => {
    refreshing ??= withTabLock(`kadai-refresh-${role}`, async () => {
      try {
        const session = await api.post<AuthSession | null>(`${basePath}/refresh`);
        applySession(session);
        return session !== null;
      } catch {
        applySession(null);
        return false;
      }
    }).finally(() => {
      refreshing = null;
    });
    return refreshing;
  };

  api.setRefreshHandler(refresh);

  // Pages load their data before the provider's restore runs, so the first request can start it.
  api.setRequestGate(() => (state.status === 'loading' ? refresh() : refreshing));

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    restore: async () => {
      await refresh();
    },
    login: async (input) => {
      applySession(await api.post<AuthSession>(`${basePath}/login`, input));
    },
    register: async (input) => {
      applySession(await api.post<AuthSession>(`${basePath}/register`, input));
    },
    logout: async () => {
      await api.post(`${basePath}/logout`);
      applySession(null);
    },
  };
}
