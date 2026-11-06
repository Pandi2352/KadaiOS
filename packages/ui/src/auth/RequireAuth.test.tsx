import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { ApiClient } from '../api/createApiClient';
import { AuthProvider } from './AuthProvider';
import { createAuthClient } from './createAuthClient';
import { RequireAuth } from './RequireAuth';
import { getReturnPath } from './returnPath';

const USER = { id: '1', name: 'Admin', email: 'a@kadaios.test', role: 'admin' as const };
const SESSION = { accessToken: 't', expiresIn: 900, user: USER };

function LoginProbe() {
  const { state } = useLocation();
  return <p>Login page, return to {getReturnPath(state, '/fallback')}</p>;
}

const renderApp = (post: ReturnType<typeof vi.fn>, path = '/reports?range=week') => {
  const api = { post, setAccessToken: vi.fn(), setRefreshHandler: vi.fn(), setRequestGate: vi.fn() };
  const auth = createAuthClient({ api: api as unknown as ApiClient, role: 'admin' });
  render(
    <AuthProvider auth={auth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginProbe />} />
          <Route
            path="*"
            element={
              <RequireAuth loginPath="/login">
                <p>Secret page</p>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
  return auth;
};

describe('RequireAuth', () => {
  it('shows only a loader while the session restores', () => {
    renderApp(vi.fn(() => new Promise(() => {})));

    expect(screen.getByText('Checking your session')).toBeTruthy();
    expect(screen.queryByText('Secret page')).toBeNull();
    expect(screen.queryByText(/Login page/)).toBeNull();
  });

  it('shows the page to a logged-in person', async () => {
    renderApp(vi.fn().mockResolvedValue(SESSION));
    expect(await screen.findByText('Secret page')).toBeTruthy();
  });

  it('sends everyone else to login, remembering the full address', async () => {
    renderApp(vi.fn().mockResolvedValue(null));
    expect(await screen.findByText('Login page, return to /reports?range=week')).toBeTruthy();
    expect(screen.queryByText('Secret page')).toBeNull();
  });

  it('sends people to login when the session ends while they are on the page', async () => {
    const post = vi.fn().mockResolvedValueOnce(SESSION).mockResolvedValueOnce({ loggedOut: true });
    const auth = renderApp(post);
    await screen.findByText('Secret page');

    await act(() => auth.logout());

    expect(await screen.findByText(/Login page/)).toBeTruthy();
    expect(screen.queryByText('Secret page')).toBeNull();
  });
});

describe('getReturnPath', () => {
  it('uses the fallback when nothing sent them here', () => {
    expect(getReturnPath(null, '/home')).toBe('/home');
    expect(getReturnPath({}, '/home')).toBe('/home');
  });

  it('keeps the query and hash', () => {
    const from = { pathname: '/a', search: '?b=1', hash: '#c' };
    expect(getReturnPath({ from }, '/home')).toBe('/a?b=1#c');
  });
});
