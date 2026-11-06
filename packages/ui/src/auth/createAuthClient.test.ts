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

  describe('when a session ends', () => {
    const setup = (post: ReturnType<typeof vi.fn>) => {
      const { client, triggerRefresh } = fakeApi();
      (client.post as ReturnType<typeof vi.fn>).mockImplementation(post);
      const auth = createAuthClient({ api: client, role: 'admin' });
      const ended = vi.fn();
      auth.onSessionEnded(ended);
      return { auth, ended, triggerRefresh };
    };
    const unauthorized = new ApiError({ statusCode: 401, message: 'Ended' });

    it('tells listeners when the server refuses the session mid-use', async () => {
      const { auth, ended, triggerRefresh } = setup(
        vi.fn().mockResolvedValueOnce(SESSION).mockRejectedValueOnce(unauthorized),
      );
      await auth.restore();
      await triggerRefresh();

      expect(ended).toHaveBeenCalledTimes(1);
      expect(auth.getState().status).toBe('anonymous');
    });

    it('tells listeners when a reload finds a session the server refuses', async () => {
      const { auth, ended } = setup(vi.fn().mockRejectedValueOnce(unauthorized));
      await auth.restore();

      expect(ended).toHaveBeenCalledTimes(1);
    });

    it('tells listeners when the cookie has gone mid-use', async () => {
      const { auth, ended, triggerRefresh } = setup(vi.fn().mockResolvedValueOnce(SESSION).mockResolvedValueOnce(null));
      await auth.restore();
      await triggerRefresh();

      expect(ended).toHaveBeenCalledTimes(1);
    });

    it('stays quiet for someone who simply is not logged in', async () => {
      const { auth, ended } = setup(vi.fn().mockResolvedValueOnce(null));
      await auth.restore();

      expect(ended).not.toHaveBeenCalled();
      expect(auth.getState().status).toBe('anonymous');
    });

    it('stays quiet on a normal logout', async () => {
      const { auth, ended } = setup(vi.fn().mockResolvedValueOnce(SESSION).mockResolvedValueOnce({ loggedOut: true }));
      await auth.restore();
      await auth.logout();

      expect(ended).not.toHaveBeenCalled();
    });

    it.each([
      ['the network drops', new ApiError({ statusCode: 0, message: 'Offline' })],
      ['the server has an error', new ApiError({ statusCode: 500, message: 'Broken' })],
    ])('keeps the session when %s', async (_label, failure) => {
      const { auth, ended, triggerRefresh } = setup(
        vi.fn().mockResolvedValueOnce(SESSION).mockRejectedValueOnce(failure),
      );
      await auth.restore();
      const refreshed = await triggerRefresh();

      expect(refreshed).toBe(false);
      expect(ended).not.toHaveBeenCalled();
      expect(auth.getState().status).toBe('authenticated');
    });

    it('shows the login page without a message when the server is down on load', async () => {
      const { auth, ended } = setup(vi.fn().mockRejectedValueOnce(new ApiError({ statusCode: 0, message: 'Offline' })));
      await auth.restore();

      expect(ended).not.toHaveBeenCalled();
      expect(auth.getState().status).toBe('anonymous');
    });

    it('stops telling a listener once it unsubscribes', async () => {
      const { client, post } = fakeApi();
      post.mockRejectedValueOnce(unauthorized);
      const auth = createAuthClient({ api: client, role: 'admin' });
      const ended = vi.fn();
      auth.onSessionEnded(ended)();
      await auth.restore();

      expect(ended).not.toHaveBeenCalled();
    });
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
