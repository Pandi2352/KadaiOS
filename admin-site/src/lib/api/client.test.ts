import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, NETWORK_ERROR_MESSAGE } from './ApiError';
import { api } from './client';

const respond = (status: number, body: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => vi.restoreAllMocks());

describe('api client', () => {
  it('returns data from a successful response', async () => {
    respond(200, { success: true, data: { id: '1' } });
    await expect(api.get('/shops/1')).resolves.toEqual({ id: '1' });
  });

  it('uses the versioned base path and skips undefined query values', async () => {
    const fetchMock = respond(200, { success: true, data: [] });
    await api.get('/shops', { query: { page: 2, limit: undefined } });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/shops?page=2');
  });

  it('sends JSON bodies', async () => {
    const fetchMock = respond(201, { success: true, data: {} });
    await api.post('/shops', { name: 'a' });

    const init = fetchMock.mock.calls[0][1];
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"name":"a"}');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('throws ApiError with messages and fields', async () => {
    respond(400, { success: false, error: { statusCode: 400, message: ['Bad'], fields: { name: ['Bad'] } } });

    const error = await api.post('/shops', {}).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).statusCode).toBe(400);
    expect((error as ApiError).fields).toEqual({ name: ['Bad'] });
  });

  it('reports an unreachable server', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await api.get('/shops').catch((caught: unknown) => caught);
    expect((error as ApiError).statusCode).toBe(0);
    expect((error as ApiError).message).toBe(NETWORK_ERROR_MESSAGE);
  });

  it('treats a non-API response, like a proxy error page, as unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }));

    const error = await api.get('/shops').catch((caught: unknown) => caught);
    expect((error as ApiError).message).toBe(NETWORK_ERROR_MESSAGE);
  });

  it('lets cancelled requests through unchanged', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    await expect(api.get('/shops')).rejects.toMatchObject({ name: 'AbortError' });
  });
});
