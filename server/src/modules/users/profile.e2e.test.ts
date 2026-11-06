import type { ApiFailure, ApiSuccess, AuthSession, UserProfile } from '@kadai/shared';
import { generateUuid } from '@kadai/shared';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { appConfig } from '../../config/app.config.js';
import { createTestApp, dropTestDatabase, type TestApp } from '../../test/create-test-app.js';
import { AuthModule } from '../auth/auth.module.js';

const ADMIN = { email: 'admin@kadaios.test', password: 'Admin@12345' };

describe('profile API', () => {
  let test: TestApp;
  let connection: Connection;
  let adminToken: string;

  const send = (method: string, token: string | undefined, body?: unknown) =>
    fetch(test.url('/users/me'), {
      method,
      headers: {
        ...(token && { authorization: `Bearer ${token}` }),
        ...(body !== undefined && { 'content-type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  const registerCustomer = async (phone?: string) => {
    const email = `profile-${generateUuid()}@kadaios.test`;
    const response = await fetch(test.url('/auth/customer/register'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Customer', email, password: 'a-long-password', ...(phone && { phone }) }),
    });
    const { data } = (await response.json()) as ApiSuccess<AuthSession>;
    return {
      token: data.accessToken,
      email,
      id: data.user.id,
      cookie: response.headers.getSetCookie()[0].split(';')[0],
    };
  };

  const dataOf = async (response: Response) => ((await response.json()) as ApiSuccess<UserProfile>).data;

  beforeAll(async () => {
    Object.assign(process.env, {
      JWT_ACCESS_SECRET: 'test-secret-'.repeat(4),
      AUTH_RATE_LIMIT: '100000',
      DEFAULT_ADMIN_EMAIL: ADMIN.email,
      DEFAULT_ADMIN_PASSWORD: ADMIN.password,
    });
    test = await createTestApp({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [appConfig] }),
        MongooseModule.forRoot(`mongodb://localhost:27017/kadai_profile_test_${process.pid}`),
        AuthModule,
      ],
    });
    connection = test.app.get<Connection>(getConnectionToken());
    const login = await fetch(test.url('/auth/admin/login'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(ADMIN),
    });
    adminToken = ((await login.json()) as ApiSuccess<AuthSession>).data.accessToken;
  });

  afterAll(async () => {
    await dropTestDatabase(connection);
    await test.close();
  });

  describe('reading', () => {
    it('needs a login', async () => {
      expect((await send('GET', undefined)).status).toBe(401);
      expect((await send('PUT', undefined, { name: 'x' })).status).toBe(401);
    });

    it('returns your own profile as an admin', async () => {
      const response = await send('GET', adminToken);
      const data = await dataOf(response);

      expect(response.status).toBe(200);
      expect(data).toMatchObject({ email: ADMIN.email, role: 'admin' });
      expect(new Date(data.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('returns your own profile as a customer', async () => {
      const customer = await registerCustomer('+919000000000');
      const data = await dataOf(await send('GET', customer.token));

      expect(data).toMatchObject({ id: customer.id, email: customer.email, role: 'customer', phone: '+919000000000' });
    });

    it('returns nothing private', async () => {
      const text = await (await send('GET', adminToken)).text();
      const data = (JSON.parse(text) as ApiSuccess<UserProfile>).data;

      expect(text).not.toContain('passwordHash');
      expect(text).not.toContain('argon2');
      expect(Object.keys(data).sort()).toEqual(['createdAt', 'email', 'id', 'name', 'role']);
    });
  });

  describe('updating', () => {
    it('saves the name and phone, trimmed and normalised', async () => {
      const customer = await registerCustomer();
      const response = await send('PUT', customer.token, { name: '  New Name  ', phone: ' +91 90000-11111 ' });
      const data = await dataOf(response);

      expect(response.status).toBe(200);
      expect(data).toMatchObject({ name: 'New Name', phone: '+919000011111' });
      expect(await dataOf(await send('GET', customer.token))).toMatchObject({
        name: 'New Name',
        phone: '+919000011111',
      });
    });

    it.each([
      ['left out', {}],
      ['sent empty', { phone: '' }],
      ['sent as spaces', { phone: '   ' }],
    ])('removes the phone when it is %s', async (_label, change) => {
      const customer = await registerCustomer('+919000000000');
      const data = await dataOf(await send('PUT', customer.token, { name: 'Customer', ...change }));

      expect(data.phone).toBeUndefined();
      const stored = await connection.collection('users').findOne({ email: customer.email });
      expect(stored).not.toHaveProperty('phone');
    });

    it.each([
      ['no name', { phone: '+919000000000' }, 'name'],
      ['a blank name', { name: '   ' }, 'name'],
      ['a name that is too long', { name: 'x'.repeat(121) }, 'name'],
      ['an invalid phone', { name: 'a', phone: 'not a phone' }, 'phone'],
    ])('returns field errors for %s', async (_label, body, field) => {
      const customer = await registerCustomer();
      const response = await send('PUT', customer.token, body);
      const failure = (await response.json()) as ApiFailure;

      expect(response.status).toBe(400);
      expect(failure.error.fields?.[field]).toBeDefined();
    });

    it.each([
      ['role', { role: 'admin' }],
      ['email', { email: 'taken@kadaios.test' }],
      ['password hash', { passwordHash: 'x' }],
      ['active flag', { isActive: false }],
      ['another user id', { id: 'someone-else', _id: 'someone-else' }],
    ])('refuses to change %s', async (_label, change) => {
      const customer = await registerCustomer();
      const response = await send('PUT', customer.token, { name: 'Sneaky', ...change });

      expect(response.status).toBe(400);
      const stored = await connection.collection('users').findOne({ email: customer.email });
      expect(stored).toMatchObject({ name: 'Customer', role: 'customer', isActive: true });
    });

    it('only changes the logged-in user', async () => {
      const first = await registerCustomer();
      const second = await registerCustomer();
      await send('PUT', first.token, { name: 'Changed' });

      expect((await dataOf(await send('GET', second.token))).name).toBe('Customer');
    });

    it('keeps the password working', async () => {
      const customer = await registerCustomer();
      await send('PUT', customer.token, { name: 'Changed' });

      const login = await fetch(test.url('/auth/customer/login'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: customer.email, password: 'a-long-password' }),
      });
      expect(login.status).toBe(200);
    });

    it('shows the new name when the session refreshes', async () => {
      const customer = await registerCustomer();
      await send('PUT', customer.token, { name: 'Refreshed Name' });

      const refresh = await fetch(test.url('/auth/customer/refresh'), {
        method: 'POST',
        headers: { cookie: customer.cookie },
      });
      expect(((await refresh.json()) as ApiSuccess<AuthSession>).data.user.name).toBe('Refreshed Name');
    });

    it('blocks a deactivated user', async () => {
      const customer = await registerCustomer();
      await connection.collection('users').updateOne({ email: customer.email }, { $set: { isActive: false } });

      expect((await send('GET', customer.token)).status).toBe(401);
      expect((await send('PUT', customer.token, { name: 'x' })).status).toBe(401);
    });
  });
});
