import type { ApiFailure, ApiSuccess, AuthSession } from '@kadai/shared';
import { generateUuid } from '@kadai/shared';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { appConfig } from '../../config/app.config.js';
import { createTestApp, dropTestDatabase, type TestApp } from '../../test/create-test-app.js';
import { DefaultUsersService } from '../users/default-users.service.js';
import { AuthModule } from './auth.module.js';

const ADMIN = { email: 'admin@kadaios.test', password: 'Admin@12345' };
const PASSWORD = 'a-long-password';
const JSON_HEADERS = { 'content-type': 'application/json' };

describe('account API', () => {
  let test: TestApp;
  let connection: Connection;

  const post = (path: string, body: unknown) =>
    fetch(test.url(path), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

  const cookieOf = (response: Response) => response.headers.getSetCookie()[0].split(';')[0];

  const registerCustomer = async () => {
    const email = `account-${generateUuid()}@kadaios.test`;
    const response = await post('/auth/customer/register', { name: 'Customer', email, password: PASSWORD });
    const { data } = (await response.json()) as ApiSuccess<AuthSession>;
    return { email, token: data.accessToken, cookie: cookieOf(response) };
  };

  const put = (path: string, token: string | undefined, body: unknown) =>
    fetch(test.url(path), {
      method: 'PUT',
      headers: { ...JSON_HEADERS, ...(token && { authorization: `Bearer ${token}` }) },
      body: JSON.stringify(body),
    });

  const login = (email: string, password: string) => post('/auth/customer/login', { email, password });

  const refresh = (cookie: string) =>
    fetch(test.url('/auth/customer/refresh'), { method: 'POST', headers: { cookie } });

  const fieldsOf = async (response: Response) => ((await response.json()) as ApiFailure).error.fields;

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
        MongooseModule.forRoot(`mongodb://localhost:27017/kadai_account_test_${process.pid}`),
        AuthModule,
      ],
    });
    connection = test.app.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await dropTestDatabase(connection);
    await test.close();
  });

  it('needs a login', async () => {
    const body = { currentPassword: PASSWORD, newPassword: 'another-long-password' };
    expect((await put('/users/me/password', undefined, body)).status).toBe(401);
    expect((await put('/users/me/email', undefined, { email: 'a@b.co', currentPassword: PASSWORD })).status).toBe(401);
  });

  describe('changing the password', () => {
    const change = { currentPassword: PASSWORD, newPassword: 'another-long-password' };

    it('replaces the password', async () => {
      const customer = await registerCustomer();
      expect((await put('/users/me/password', customer.token, change)).status).toBe(200);

      expect((await login(customer.email, PASSWORD)).status).toBe(401);
      expect((await login(customer.email, change.newPassword)).status).toBe(200);
    });

    it('logs out other devices and keeps this one logged in', async () => {
      const customer = await registerCustomer();
      const response = await put('/users/me/password', customer.token, change);

      expect((await refresh(customer.cookie)).status).toBe(401);
      expect((await refresh(cookieOf(response))).status).toBe(200);
      expect(((await response.json()) as ApiSuccess<AuthSession>).data.accessToken).toBeTruthy();
    });

    it('rejects a wrong current password on its field, without ending the login', async () => {
      const customer = await registerCustomer();
      const response = await put('/users/me/password', customer.token, {
        ...change,
        currentPassword: 'wrong-password',
      });

      expect(response.status).toBe(400);
      expect((await fieldsOf(response))?.currentPassword).toEqual(['Current password is incorrect']);
      expect((await login(customer.email, PASSWORD)).status).toBe(200);
      expect((await refresh(customer.cookie)).status).toBe(200);
    });

    it.each([
      ['the same password', { currentPassword: PASSWORD, newPassword: PASSWORD }, 'newPassword'],
      ['a short password', { currentPassword: PASSWORD, newPassword: 'short' }, 'newPassword'],
      ['no current password', { newPassword: 'another-long-password' }, 'currentPassword'],
    ])('rejects %s', async (_label, body, field) => {
      const customer = await registerCustomer();
      const response = await put('/users/me/password', customer.token, body);

      expect(response.status).toBe(400);
      expect((await fieldsOf(response))?.[field]).toBeDefined();
      expect((await login(customer.email, PASSWORD)).status).toBe(200);
    });
  });

  describe('changing the email', () => {
    const newEmail = () => `moved-${generateUuid()}@kadaios.test`;

    it('moves the login to the new email, and returns it', async () => {
      const customer = await registerCustomer();
      const email = newEmail();
      const response = await put('/users/me/email', customer.token, {
        email: `  ${email.toUpperCase()}  `,
        currentPassword: PASSWORD,
      });

      expect(response.status).toBe(200);
      expect(((await response.json()) as ApiSuccess<AuthSession>).data.user.email).toBe(email);
      expect((await login(customer.email, PASSWORD)).status).toBe(401);
      expect((await login(email, PASSWORD)).status).toBe(200);
    });

    it('logs out other devices and keeps this one logged in', async () => {
      const customer = await registerCustomer();
      const response = await put('/users/me/email', customer.token, { email: newEmail(), currentPassword: PASSWORD });

      expect((await refresh(customer.cookie)).status).toBe(401);
      expect((await refresh(cookieOf(response))).status).toBe(200);
    });

    it('needs the current password', async () => {
      const customer = await registerCustomer();
      const response = await put('/users/me/email', customer.token, {
        email: newEmail(),
        currentPassword: 'wrong-one',
      });

      expect(response.status).toBe(400);
      expect((await fieldsOf(response))?.currentPassword).toBeDefined();
      expect((await login(customer.email, PASSWORD)).status).toBe(200);
    });

    it('refuses an email another account uses', async () => {
      const first = await registerCustomer();
      const second = await registerCustomer();
      const response = await put('/users/me/email', second.token, { email: first.email, currentPassword: PASSWORD });

      expect(response.status).toBe(409);
      expect((await fieldsOf(response))?.email).toEqual(['Another account already uses this email']);
    });

    it.each([
      ['an invalid email', () => 'not-an-email'],
      ['no change', (current: string) => current],
    ])('refuses %s', async (_label, email) => {
      const customer = await registerCustomer();
      const response = await put('/users/me/email', customer.token, {
        email: email(customer.email),
        currentPassword: PASSWORD,
      });

      expect(response.status).toBe(400);
      expect((await fieldsOf(response))?.email).toBeDefined();
    });

    it('refuses other changes in the same request', async () => {
      const customer = await registerCustomer();
      const response = await put('/users/me/email', customer.token, {
        email: newEmail(),
        currentPassword: PASSWORD,
        role: 'admin',
      });

      expect(response.status).toBe(400);
      expect((await login(customer.email, PASSWORD)).status).toBe(200);
    });

    it('does not bring back the default admin after a restart', async () => {
      const adminLogin = await post('/auth/admin/login', ADMIN);
      const { accessToken } = ((await adminLogin.json()) as ApiSuccess<AuthSession>).data;
      const moved = await put('/users/me/email', accessToken, { email: newEmail(), currentPassword: ADMIN.password });
      expect(moved.status).toBe(200);

      await test.app.get(DefaultUsersService, { strict: false }).onApplicationBootstrap();

      expect(await connection.collection('users').countDocuments({ role: 'admin' })).toBe(1);
      expect((await post('/auth/admin/login', ADMIN)).status).toBe(401);
    });
  });
});
