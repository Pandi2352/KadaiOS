import { type ReactNode, useEffect, useMemo, useSyncExternalStore } from 'react';
import { createStrictContext } from '../createStrictContext';
import type { AuthClient, AuthState } from './createAuthClient';

type AuthValue = AuthState & Pick<AuthClient, 'login' | 'register' | 'logout' | 'onSessionEnded'>;

const [Provider, useAuth] = createStrictContext<AuthValue>('Auth');

export { useAuth };

export function AuthProvider({ auth, children }: { auth: AuthClient; children: ReactNode }) {
  const state = useSyncExternalStore(auth.subscribe, auth.getState);

  useEffect(() => {
    void auth.restore();
  }, [auth]);

  const value = useMemo(
    () => ({
      ...state,
      login: auth.login,
      register: auth.register,
      logout: auth.logout,
      onSessionEnded: auth.onSessionEnded,
    }),
    [state, auth],
  );

  return <Provider value={value}>{children}</Provider>;
}
