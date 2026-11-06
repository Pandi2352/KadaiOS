import type { AuthSession } from '@kadai/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/ApiError';
import type { ApiClient } from '../api/createApiClient';
import { ToastProvider } from '../components/toast/ToastContext';
import { AuthProvider } from './AuthProvider';
import { createAuthClient } from './createAuthClient';
import { useAuthActions } from './useAuthActions';

const SESSION: AuthSession = {
  accessToken: 't',
  expiresIn: 900,
  user: { id: '1', name: 'Kavi', email: 'k@kadaios.test', role: 'admin' },
};

function Actions({
  onLogout,
  onLoginError,
}: {
  onLogout: (done: boolean) => void;
  onLoginError: (e: unknown) => void;
}) {
  const { loginWithToast, logoutWithToast } = useAuthActions();
  return (
    <>
      <button onClick={() => loginWithToast({ email: 'k@kadaios.test', password: 'x' }).catch(onLoginError)}>
        Log in
      </button>
      <button onClick={() => void logoutWithToast().then(onLogout)}>Log out</button>
    </>
  );
}

const setup = (post: ReturnType<typeof vi.fn>) => {
  const api = { post, setAccessToken: vi.fn(), setRefreshHandler: vi.fn(), setRequestGate: vi.fn() };
  const auth = createAuthClient({ api: api as unknown as ApiClient, role: 'admin' });
  const onLogout = vi.fn();
  const onLoginError = vi.fn();
  render(
    <AuthProvider auth={auth}>
      <ToastProvider>
        <Actions onLogout={onLogout} onLoginError={onLoginError} />
      </ToastProvider>
    </AuthProvider>,
  );
  return { onLogout, onLoginError };
};

const toast = (name: 'status' | 'alert') => screen.findByRole(name, { hidden: true });

describe('useAuthActions', () => {
  it('welcomes people by name after logging in', async () => {
    setup(vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(SESSION));
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    const message = await toast('status');
    expect(message.textContent).toContain('Logged in');
    expect(message.textContent).toContain('Welcome back, Kavi.');
  });

  it('shows no toast for a failed login, and lets the form handle the error', async () => {
    const { onLoginError } = setup(
      vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockRejectedValueOnce(new ApiError({ statusCode: 401, message: 'Wrong' })),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await vi.waitFor(() => expect(onLoginError).toHaveBeenCalled());
    expect(screen.queryByRole('status', { hidden: true })).toBeNull();
  });

  it('confirms logging out', async () => {
    const { onLogout } = setup(vi.fn().mockResolvedValueOnce(SESSION).mockResolvedValueOnce({ loggedOut: true }));
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect((await toast('status')).textContent).toContain('Logged out');
    expect(onLogout).toHaveBeenCalledWith(true);
  });

  it('shows an error when logging out fails, and stays put', async () => {
    const { onLogout } = setup(
      vi
        .fn()
        .mockResolvedValueOnce(SESSION)
        .mockRejectedValueOnce(new ApiError({ statusCode: 0, message: 'Offline' })),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    const message = await toast('alert');
    expect(message.textContent).toContain("Couldn't log out");
    expect(message.textContent).toContain('Offline');
    expect(onLogout).toHaveBeenCalledWith(false);
  });
});
