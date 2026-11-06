import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, NETWORK_ERROR_MESSAGE } from './ApiError';
import { createApiClient } from './createApiClient';

const jsonResponse = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const respond = (status: number, body: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(status, body));
const api = () => createApiClient({ baseUrl: '/api/v1' });
const UNAUTHORIZED_BODY = { success: false, error: { statusCode: 401, message: 'Expired' } };

afterEach(() => vi.restoreAllMocks());

describe('createApiClient', () => {
  it('returns data from a successful response', async () => {
    respond(200, { success: true, data: { id: '1' } });
    await expect(api().get('/shops/1')).resolves.toEqual({ id: '1' });
  });

  it('uses the base path and skips undefined query values', async () => {
    const fetchMock = respond(200, { success: true, data: [] });
    await api().get('/shops', { query: { page: 2, limit: undefined } });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/shops?page=2');
  });

  it('sends JSON bodies and cookies', async () => {
    const fetchMock = respond(201, { success: true, data: {} });
    await api().post('/shops', { name: 'a' });

    const init = fetchMock.mock.calls[0][1];
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"name":"a"}');
    expect(init?.credentials).toBe('include');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('throws ApiError with messages and fields', async () => {
    respond(400, { success: false, error: { statusCode: 400, message: ['Bad'], fields: { name: ['Bad'] } } });

    const error = await api()
      .post('/shops', {})
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(400);
    expect((error as ApiError).fields).toEqual({ name: ['Bad'] });
  });

  it('reports an unreachable server', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await api()
      .get('/shops')
      .catch((caught: unknown) => caught);
    expect((error as ApiError).statusCode).toBe(0);
    expect((error as ApiError).message).toBe(NETWORK_ERROR_MESSAGE);
  });

  it('treats a non-API response, like a proxy error page, as unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }));

    const error = await api()
      .get('/shops')
      .catch((caught: unknown) => caught);
    expect((error as ApiError).message).toBe(NETWORK_ERROR_MESSAGE);
  });

  it('lets cancelled requests through unchanged', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    await expect(api().get('/shops')).rejects.toMatchObject({ name: 'AbortError' });
  });

  describe('access token', () => {
    it('sends the token, and stops once it is cleared', async () => {
      const fetchMock = vi
        .spyOn(globalThis, 'fetch')
        .mockImplementation(async () => jsonResponse(200, { success: true, data: {} }));
      const client = api();

      client.setAccessToken('abc');
      await client.get('/shops');
      expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ Authorization: 'Bearer abc' });

      client.setAccessToken(null);
      await client.get('/shops');
      expect(fetchMock.mock.calls[1][1]?.headers).toEqual({});
    });

    it('refreshes and retries once when a request gets a 401', async () => {
      const fetchMock = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(jsonResponse(401, UNAUTHORIZED_BODY))
        .mockResolvedValueOnce(jsonResponse(200, { success: true, data: 'ok' }));
      const client = api();
      client.setAccessToken('old');
      client.setRefreshHandler(async () => {
        client.setAccessToken('new');
        return true;
      });

      await expect(client.get('/shops')).resolves.toBe('ok');
      expect(fetchMock.mock.calls[1][1]?.headers).toEqual({ Authorization: 'Bearer new' });
    });

    it('fails when the refresh fails', async () => {
      respond(401, UNAUTHORIZED_BODY);
      const client = api();
      client.setRefreshHandler(async () => false);

      await expect(client.get('/shops')).rejects.toMatchObject({ statusCode: 401 });
    });

    it('does not loop when the retry also gets a 401', async () => {
      const fetchMock = vi
        .spyOn(globalThis, 'fetch')
        .mockImplementation(async () => jsonResponse(401, UNAUTHORIZED_BODY));
      const handler = vi.fn(async () => true);
      const client = api();
      client.setRefreshHandler(handler);

      await expect(client.get('/shops')).rejects.toMatchObject({ statusCode: 401 });
      expect(handler).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('holds requests until the gate opens, then sends the new token', async () => {
      const fetchMock = respond(200, { success: true, data: 'ok' });
      const client = api();
      let openGate = () => {};
      const gate = new Promise<void>((resolve) => {
        openGate = resolve;
      });
      client.setRequestGate(() => gate);

      const pending = client.get('/shops');
      await Promise.resolve();
      expect(fetchMock).not.toHaveBeenCalled();

      client.setAccessToken('restored');
      openGate();
      await pending;
      expect(fetchMock.mock.calls[0][1]?.headers).toEqual({ Authorization: 'Bearer restored' });
    });

    it('lets auth requests past the gate, because the gate waits for them', async () => {
      const fetchMock = respond(200, { success: true, data: null });
      const client = api();
      client.setRequestGate(() => new Promise(() => {}));

      await client.post('/auth/admin/refresh');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('never refreshes for a failed login', async () => {
      respond(401, UNAUTHORIZED_BODY);
      const handler = vi.fn(async () => true);
      const client = api();
      client.setRefreshHandler(handler);

      await expect(client.post('/auth/admin/login', {})).rejects.toMatchObject({ statusCode: 401 });
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
