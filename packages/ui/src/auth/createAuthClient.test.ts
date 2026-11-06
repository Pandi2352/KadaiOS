import type { AuthSession } from '@kadai/shared';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/ApiError';
import type { ApiClient } from '../api/createApiClient';
import { createAuthClient } from './createAuthClient';

const SESSION: AuthSession = {
  accessToken: 'token',
  expiresIn: 900,
  user: { id: '1', name: 'A', email: 'a@kadaios.test', role: 'admin' },
};

const fakeApi = () => {
  const post = vi.fn();
  let refreshHandler: (() => Promise<boolean>) | null = null;
  let requestGate: (() => Promise<unknown> | null) | null = null;
  const client = {
    post,
    setAccessToken: vi.fn(),
    setRefreshHandler: (handler: () => Promise<boolean>) => {
      refreshHandler = handler;
    },
    setRequestGate: (gate: () => Promise<unknown> | null) => {
      requestGate = gate;
    },
  } as unknown as ApiClient;
  return { client, post, triggerRefresh: () => refreshHandler?.(), openGate: () => requestGate?.() };
};

describe('createAuthClient', () => {
  it('starts as loading', () => {
    const auth = createAuthClient({ api: fakeApi().client, role: 'admin' });
    expect(auth.getState()).toEqual({ status: 'loading', user: null });
  });

  it('restores a session from the cookie', async () => {
    const { client, post } = fakeApi();
    post.mockResolvedValue(SESSION);
    const auth = createAuthClient({ api: client, role: 'admin' });

    await auth.restore();

    expect(post).toHaveBeenCalledWith('/auth/admin/refresh');
    expect(auth.getState()).toEqual({ status: 'authenticated', user: SESSION.user });
    expect(client.setAccessToken).toHaveBeenCalledWith('token');
  });

  it('is anonymous when there is no session', async () => {
    const { client, post } = fakeApi();
    post.mockResolvedValue(null);
    const auth = createAuthClient({ api: client, role: 'customer' });

    await auth.restore();

    expect(post).toHaveBeenCalledWith('/auth/customer/refresh');
    expect(auth.getState().status).toBe('anonymous');
  });

  it('is anonymous when restoring fails', async () => {
    const { client, post } = fakeApi();
    post.mockRejectedValue(new ApiError({ statusCode: 401, message: 'Ended' }));
    const auth = createAuthClient({ api: client, role: 'admin' });

    await auth.restore();

    expect(auth.getState().status).toBe('anonymous');
    expect(client.setAccessToken).toHaveBeenLastCalledWith(null);
  });

  it('sends one refresh when several ask at once, because each token works once', async () => {
    const { client, post, triggerRefresh } = fakeApi();
    post.mockResolvedValue(SESSION);
    const auth = createAuthClient({ api: client, role: 'admin' });

    await Promise.all([auth.restore(), auth.restore(), triggerRefresh()]);

    expect(post).toHaveBeenCalledTimes(1);
  });

  it('restores the session for a request made before the provider has started', async () => {
    const { client, post, openGate } = fakeApi();
    post.mockResolvedValue(SESSION);
    const auth = createAuthClient({ api: client, role: 'admin' });

    await openGate();

    expect(post).toHaveBeenCalledWith('/auth/admin/refresh');
    expect(auth.getState().status).toBe('authenticated');
    expect(openGate()).toBeNull();
  });

  it('logs in and notifies subscribers', async () => {
    const { client, post } = fakeApi();
    post.mockResolvedValue(SESSION);
    const auth = createAuthClient({ api: client, role: 'admin' });
    const listener = vi.fn();
    auth.subscribe(listener);

    await auth.login({ email: 'a@kadaios.test', password: 'password' });

    expect(post).toHaveBeenCalledWith('/auth/admin/login', { email: 'a@kadaios.test', password: 'password' });
    expect(auth.getState().user).toEqual(SESSION.user);
    expect(listener).toHaveBeenCalled();
  });

  it('lets a failed login reach the form, and stays logged out', async () => {
    const { client, post } = fakeApi();
    post.mockRejectedValue(new ApiError({ statusCode: 401, message: 'Wrong' }));
    const auth = createAuthClient({ api: client, role: 'admin' });

    await expect(auth.login({ email: 'a@kadaios.test', password: 'x' })).rejects.toThrow('Wrong');
    expect(auth.getState().user).toBeNull();
  });

  it('clears the token on logout', async () => {
    const { client, post } = fakeApi();
    post.mockResolvedValueOnce(SESSION).mockResolvedValueOnce({ loggedOut: true });
    const auth = createAuthClient({ api: client, role: 'admin' });
    await auth.restore();

    await auth.logout();

    expect(post).toHaveBeenLastCalledWith('/auth/admin/logout');
    expect(auth.getState()).toEqual({ status: 'anonymous', user: null });
    expect(client.setAccessToken).toHaveBeenLastCalledWith(null);
  });

  it('stays logged in if logout could not reach the server', async () => {
    const { client, post } = fakeApi();
    post.mockResolvedValueOnce(SESSION).mockRejectedValueOnce(new ApiError({ statusCode: 0, message: 'Offline' }));
    const auth = createAuthClient({ api: client, role: 'admin' });
    await auth.restore();

    await expect(auth.logout()).rejects.toThrow('Offline');
    expect(auth.getState().status).toBe('authenticated');
  });
});
