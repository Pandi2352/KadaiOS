import { NotFoundException } from '@nestjs/common';
import { type ApiFailure, type ApiSuccess, generateUuid, type Shop } from '@kadai/shared';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestApp, type TestApp } from '../../test/create-test-app.js';
import { ShopsController } from './shops.controller.js';
import { ShopsRepository } from './shops.repository.js';
import { ShopsService } from './shops.service.js';

const repository = { create: vi.fn(), findPage: vi.fn(), findByIdOrThrow: vi.fn() };

const post = (body: unknown) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

describe('shops API', () => {
  let test: TestApp;

  beforeAll(async () => {
    test = await createTestApp({
      controllers: [ShopsController],
      providers: [ShopsService, { provide: ShopsRepository, useValue: repository }],
    });
  });

  afterAll(() => test.close());

  beforeEach(() => {
    vi.clearAllMocks();
    repository.create.mockImplementation(async (dto: object) => ({ id: generateUuid(), ...dto }));
  });

  it('creates a shop and wraps the response', async () => {
    const response = await fetch(test.url('/shops'), post({ name: 'Corner Shop', businessType: 'meat' }));
    const body = (await response.json()) as ApiSuccess<Shop>;

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('Corner Shop');
  });

  it('trims text and normalises the phone before saving', async () => {
    await fetch(
      test.url('/shops'),
      post({ name: '  Corner Shop  ', businessType: 'dairy', phone: ' +91 90000-00000 ', address: '  Main Road ' }),
    );

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Corner Shop', phone: '+919000000000', address: 'Main Road' }),
    );
  });

  it('treats empty optional fields as not provided', async () => {
    await fetch(test.url('/shops'), post({ name: 'a', businessType: 'meat', phone: '  ', address: '' }));

    const saved = repository.create.mock.calls[0][0];
    expect(saved.phone).toBeUndefined();
    expect(saved.address).toBeUndefined();
  });

  it.each([
    ['whitespace-only name', { name: '   ', businessType: 'meat' }, 'name'],
    ['name too long', { name: 'x'.repeat(121), businessType: 'meat' }, 'name'],
    ['name not text', { name: 123, businessType: 'meat' }, 'name'],
    ['unknown business type', { name: 'a', businessType: 'bakery' }, 'businessType'],
    ['invalid phone', { name: 'a', businessType: 'meat', phone: 'not a phone' }, 'phone'],
    ['phone too short', { name: 'a', businessType: 'meat', phone: '12345' }, 'phone'],
    ['address too long', { name: 'a', businessType: 'meat', address: 'x'.repeat(501) }, 'address'],
    ['client-supplied id', { name: 'a', businessType: 'meat', _id: 'x' }, '_id'],
  ])('returns 400 with field errors for %s', async (_label, payload, field) => {
    const response = await fetch(test.url('/shops'), post(payload));
    const body = (await response.json()) as ApiFailure;

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.fields?.[field]).toBeDefined();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('applies default pagination', async () => {
    repository.findPage.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });
    const response = await fetch(test.url('/shops'));

    expect(response.status).toBe(200);
    expect(repository.findPage).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20 }));
  });

  it('rejects an invalid UUID', async () => {
    const response = await fetch(test.url('/shops/not-a-uuid'));
    expect(response.status).toBe(400);
    expect(repository.findByIdOrThrow).not.toHaveBeenCalled();
  });

  it('returns 404 in the shared error format', async () => {
    repository.findByIdOrThrow.mockRejectedValue(new NotFoundException('Shop not found'));
    const response = await fetch(test.url(`/shops/${generateUuid()}`));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ success: false, error: { statusCode: 404, message: 'Shop not found' } });
  });

  it('hides unexpected errors from the client', async () => {
    repository.findPage.mockRejectedValue(new Error('secret connection detail'));
    const response = await fetch(test.url('/shops'));
    const text = await response.text();

    expect(response.status).toBe(500);
    expect(text).not.toContain('secret');
  });

  it('sends security headers and hides Express', async () => {
    const response = await fetch(test.url('/shops/not-a-uuid'));

    expect(response.headers.get('x-powered-by')).toBeNull();
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('only serves the versioned path', async () => {
    const response = await fetch(test.url('/shops').replace('/v1/', '/'));
    expect(response.status).toBe(404);
  });
});
