import { type ApiFailure, type ApiSuccess, type AuthSession, generateUuid } from '@kadai/shared';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, dropTestDatabase, type TestApp } from '../../test/create-test-app.js';
import { appConfig } from '../../config/app.config.js';
import { AccessTokenService } from './access-token.service.js';
import { AuthModule } from './auth.module.js';
import { INVALID_LOGIN_MESSAGE } from './auth.service.js';

const TEST_DB = `kadai_auth_test_${process.pid}`;
const ADMIN = { email: 'admin@kadaios.test', password: 'Admin@12345' };
const CUSTOMER = { email: 'customer@kadaios.test', password: 'Customer@12345' };

const json = (body: unknown, cookie?: string): RequestInit => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', ...(cookie && { cookie }) },
  body: JSON.stringify(body),
});

const withCookie = (cookie: string): RequestInit => ({ method: 'POST', headers: { cookie } });

/** The `name=value` part of the Set-Cookie header, as a browser would send it back. */
const cookieFrom = (response: Response) => response.headers.getSetCookie()[0]?.split(';')[0] ?? '';

const newCustomer = () => ({
  name: 'New Customer',
  email: `user-${generateUuid()}@kadaios.test`,
  password: 'a-long-password',
});

function setEnv(rateLimit: number) {
  Object.assign(process.env, {
    JWT_ACCESS_SECRET: 'test-secret-'.repeat(4),
    AUTH_RATE_LIMIT: String(rateLimit),
    DEFAULT_ADMIN_EMAIL: ADMIN.email,
    DEFAULT_ADMIN_PASSWORD: ADMIN.password,
    DEFAULT_CUSTOMER_EMAIL: CUSTOMER.email,
    DEFAULT_CUSTOMER_PASSWORD: CUSTOMER.password,
  });
}

const createAuthApp = (databaseName: string) =>
  createTestApp({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [appConfig] }),
      MongooseModule.forRoot(`mongodb://localhost:27017/${databaseName}`),
      AuthModule,
    ],
  });

describe('auth API', () => {
  let test: TestApp;
  let connection: Connection;
  const customerUrl = (path: string) => test.url(`/auth/customer${path}`);
  const adminUrl = (path: string) => test.url(`/auth/admin${path}`);
  const users = () => connection.collection('users');
  const tokens = () => connection.collection('refresh_tokens');

  beforeAll(async () => {
    setEnv(100000);
    test = await createAuthApp(TEST_DB);
    connection = test.app.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await dropTestDatabase(connection);
    await test.close();
  });

  describe('default users', () => {
    it('creates the default admin and test customer on startup', async () => {
      expect(await users().countDocuments({ email: ADMIN.email, role: 'admin' })).toBe(1);
      expect(await users().countDocuments({ email: CUSTOMER.email, role: 'customer' })).toBe(1);
    });

    it('does not create duplicates or overwrite a changed password on restart', async () => {
      const before = await users().findOne({ email: ADMIN.email, role: 'admin' });
      const restarted = await createAuthApp(TEST_DB);
      await restarted.close();

      expect(await users().countDocuments({ email: ADMIN.email, role: 'admin' })).toBe(1);
      const after = await users().findOne({ email: ADMIN.email, role: 'admin' });
      expect(after?.passwordHash).toBe(before?.passwordHash);
    });

    it('lets the default admin and customer log in', async () => {
      expect((await fetch(adminUrl('/login'), json(ADMIN))).status).toBe(200);
      expect((await fetch(customerUrl('/login'), json(CUSTOMER))).status).toBe(200);
    });
  });

  describe('registration', () => {
    it('creates a customer and logs them in', async () => {
      const input = newCustomer();
      const response = await fetch(customerUrl('/register'), json(input));
      const { data } = (await response.json()) as ApiSuccess<AuthSession>;

      expect(response.status).toBe(201);
      expect(data.user).toMatchObject({ name: input.name, email: input.email, role: 'customer' });
      expect(data.accessToken).toBeTruthy();
      expect(cookieFrom(response)).toContain('kadai_customer_refresh=');
    });

    it('stores an Argon2id hash and never returns it', async () => {
      const input = newCustomer();
      const response = await fetch(customerUrl('/register'), json(input));
      const text = await response.text();
      const stored = await users().findOne({ email: input.email });

      expect(stored?.passwordHash).toMatch(/^\$argon2id\$/);
      expect(stored?.passwordHash).not.toContain(input.password);
      expect(text).not.toContain('passwordHash');
      expect(text).not.toContain(input.password);
    });

    it('uses a UUID, not an ObjectId', async () => {
      const input = newCustomer();
      await fetch(customerUrl('/register'), json(input));
      const stored = await users().findOne({ email: input.email });
      expect(typeof stored?._id).toBe('string');
    });

    it('cannot be made into an admin by the request', async () => {
      const input = { ...newCustomer(), role: 'admin' };
      const response = await fetch(customerUrl('/register'), json(input));

      expect(response.status).toBe(400);
      expect(await users().countDocuments({ email: input.email })).toBe(0);
    });

    it('has no admin registration route', async () => {
      const response = await fetch(adminUrl('/register'), json(newCustomer()));
      expect(response.status).toBe(404);
    });

    it('rejects a duplicate email, ignoring letter case', async () => {
      const input = newCustomer();
      await fetch(customerUrl('/register'), json(input));
      const response = await fetch(customerUrl('/register'), json({ ...input, email: input.email.toUpperCase() }));
      const body = (await response.json()) as ApiFailure;

      expect(response.status).toBe(409);
      expect(body.error.fields?.email).toBeDefined();
    });

    it('creates only one account when two requests race', async () => {
      const input = newCustomer();
      const responses = await Promise.all([
        fetch(customerUrl('/register'), json(input)),
        fetch(customerUrl('/register'), json(input)),
      ]);

      expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
      expect(await users().countDocuments({ email: input.email })).toBe(1);
    });

    it('allows a customer account with the same email as an admin, and keeps them separate', async () => {
      const response = await fetch(customerUrl('/register'), json({ ...newCustomer(), email: ADMIN.email }));
      expect(response.status).toBe(201);
      expect(await users().countDocuments({ email: ADMIN.email })).toBe(2);
    });

    it.each([
      ['missing name', { name: '' }, 'name'],
      ['invalid email', { email: 'nope' }, 'email'],
      ['short password', { password: 'short' }, 'password'],
      ['very long password', { password: 'x'.repeat(129) }, 'password'],
      ['invalid phone', { phone: 'not a phone' }, 'phone'],
    ])('returns field errors for %s', async (_label, change, field) => {
      const response = await fetch(customerUrl('/register'), json({ ...newCustomer(), ...change }));
      const body = (await response.json()) as ApiFailure;

      expect(response.status).toBe(400);
      expect(body.error.fields?.[field]).toBeDefined();
    });

    it('does not trim passwords', async () => {
      const input = { ...newCustomer(), password: '  spaces around  ' };
      await fetch(customerUrl('/register'), json(input));
      const { email, password } = input;

      expect((await fetch(customerUrl('/login'), json({ email, password }))).status).toBe(200);
      expect((await fetch(customerUrl('/login'), json({ email, password: 'spaces around' }))).status).toBe(401);
    });
  });

  describe('login', () => {
    it('sets a secure-by-default refresh cookie', async () => {
      const response = await fetch(adminUrl('/login'), json(ADMIN));
      const header = response.headers.getSetCookie()[0];

      expect(header).toContain('HttpOnly');
      expect(header).toContain('SameSite=Strict');
      expect(header).toContain('Path=/api/v1/auth/admin');
      expect(header).toContain('kadai_admin_refresh=');
    });

    it('accepts any letter case in the email', async () => {
      const response = await fetch(adminUrl('/login'), json({ ...ADMIN, email: ADMIN.email.toUpperCase() }));
      expect(response.status).toBe(200);
    });

    it('gives the same answer for a wrong password and an unknown email', async () => {
      const wrongPassword = await fetch(adminUrl('/login'), json({ ...ADMIN, password: 'wrong-password' }));
      const unknownEmail = await fetch(
        adminUrl('/login'),
        json({ email: 'nobody@kadaios.test', password: 'x'.repeat(9) }),
      );

      expect(wrongPassword.status).toBe(401);
      expect(unknownEmail.status).toBe(401);
      expect(await wrongPassword.json()).toEqual(await unknownEmail.json());
      expect(wrongPassword.headers.getSetCookie()).toEqual([]);
    });

    it('keeps admins and customers apart', async () => {
      expect((await fetch(adminUrl('/login'), json(CUSTOMER))).status).toBe(401);
      expect((await fetch(customerUrl('/login'), json({ ...ADMIN, email: 'only-admin@kadaios.test' }))).status).toBe(
        401,
      );
    });

    it('refuses a deactivated user', async () => {
      const input = newCustomer();
      await fetch(customerUrl('/register'), json(input));
      await users().updateOne({ email: input.email }, { $set: { isActive: false } });

      const response = await fetch(customerUrl('/login'), json({ email: input.email, password: input.password }));
      const body = (await response.json()) as ApiFailure;
      expect(response.status).toBe(401);
      expect(body.error.message).toBe(INVALID_LOGIN_MESSAGE);
    });

    it('records the login time', async () => {
      await fetch(adminUrl('/login'), json(ADMIN));
      const stored = await users().findOne({ email: ADMIN.email, role: 'admin' });
      expect(stored?.lastLoginAt).toBeInstanceOf(Date);
    });
  });

  describe('access token', () => {
    const service = () => test.app.select(AuthModule).get(AccessTokenService);

    const login = async () => {
      const response = await fetch(adminUrl('/login'), json(ADMIN));
      return ((await response.json()) as ApiSuccess<AuthSession>).data;
    };

    it('verifies for the right role and identifies the user', async () => {
      const { accessToken, user } = await login();
      expect(await service().verify(accessToken, 'admin')).toEqual({ sub: user.id, role: 'admin' });
    });

    it('holds no personal data or password', async () => {
      const { accessToken } = await login();
      const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString()) as object;
      expect(Object.keys(payload).sort()).toEqual(['aud', 'exp', 'iat', 'iss', 'role', 'sub']);
    });

    it('expires in 15 minutes', async () => {
      const session = await login();
      const { exp, iat } = JSON.parse(Buffer.from(session.accessToken.split('.')[1], 'base64url').toString()) as {
        exp: number;
        iat: number;
      };
      expect(exp - iat).toBe(900);
      expect(session.expiresIn).toBe(900);
    });

    it('refuses a token for another role', async () => {
      const { accessToken } = await login();
      await expect(service().verify(accessToken, 'customer')).rejects.toThrow();
    });

    it('refuses a tampered token', async () => {
      const { accessToken } = await login();
      const [header, , signature] = accessToken.split('.');
      const forged = Buffer.from(JSON.stringify({ sub: 'someone-else', role: 'admin' })).toString('base64url');
      await expect(service().verify(`${header}.${forged}.${signature}`, 'admin')).rejects.toThrow();
    });

    it('refuses an unsigned token', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({ sub: 'x', role: 'admin' })).toString('base64url');
      await expect(service().verify(`${header}.${payload}.`, 'admin')).rejects.toThrow();
    });
  });

  describe('refresh token', () => {
    const login = async () => cookieFrom(await fetch(adminUrl('/login'), json(ADMIN)));
    const refresh = (cookie: string) => fetch(adminUrl('/refresh'), withCookie(cookie));

    beforeEach(() => tokens().deleteMany({}));

    it('returns null when nobody is logged in', async () => {
      const response = await fetch(adminUrl('/refresh'), { method: 'POST' });
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true, data: null });
    });

    it('stores only a hash of the token', async () => {
      const cookie = await login();
      const raw = decodeURIComponent(cookie.split('=')[1]);
      const stored = await tokens().findOne({});

      expect(stored?.tokenHash).toMatch(/^[0-9a-f]{64}$/);
      expect(stored?.tokenHash).not.toBe(raw);
    });

    it('gives a new access token and a new refresh token', async () => {
      const cookie = await login();
      const response = await refresh(cookie);
      const { data } = (await response.json()) as ApiSuccess<AuthSession>;

      expect(response.status).toBe(200);
      expect(data.user.email).toBe(ADMIN.email);
      expect(cookieFrom(response)).not.toBe(cookie);
    });

    const ageRotatedTokens = () =>
      tokens().updateMany({ rotatedAt: { $ne: null } }, { $set: { rotatedAt: new Date(Date.now() - 60000) } });

    it('keeps the login when the browser lost the reply, such as a reload during a refresh', async () => {
      const first = await login();
      await refresh(first); // The browser never stores this response's new cookie.
      const retry = await refresh(first);

      expect(retry.status).toBe(200);
      expect(cookieFrom(retry)).not.toBe(first);
      expect((await refresh(cookieFrom(retry))).status).toBe(200);
    });

    it('keeps the login when two requests arrive together', async () => {
      const cookie = await login();
      const responses = await Promise.all([refresh(cookie), refresh(cookie)]);
      expect(responses.map((response) => response.status)).toEqual([200, 200]);
    });

    it('ends the whole login when an old token returns after the grace period', async () => {
      const first = await login();
      const second = cookieFrom(await refresh(first));
      await ageRotatedTokens();

      expect((await refresh(first)).status).toBe(401);
      expect((await refresh(second)).status).toBe(401);
    });

    it('only ends the affected login, not other devices', async () => {
      const deviceA = await login();
      const deviceB = await login();
      cookieFrom(await refresh(deviceA));
      await ageRotatedTokens();

      expect((await refresh(deviceA)).status).toBe(401);
      expect((await refresh(deviceB)).status).toBe(200);
    });

    it('never lets a recently replaced token bring back a logged-out session', async () => {
      const first = await login();
      const second = cookieFrom(await refresh(first));
      await fetch(adminUrl('/logout'), withCookie(second));

      expect((await refresh(first)).status).toBe(401);
      expect((await refresh(second)).status).toBe(401);
    });

    it('refuses a recently replaced token on the wrong role route', async () => {
      const first = await login();
      await refresh(first);
      const raw = first.split('=')[1];
      const response = await fetch(customerUrl('/refresh'), withCookie(`kadai_customer_refresh=${raw}`));
      expect(response.status).toBe(401);
    });

    it('clears the cookie when the token is invalid', async () => {
      const response = await refresh('kadai_admin_refresh=made-up');
      expect(response.status).toBe(401);
      expect(response.headers.getSetCookie()[0]).toContain('kadai_admin_refresh=;');
    });

    it('refuses an expired token', async () => {
      const cookie = await login();
      await tokens().updateMany({}, { $set: { expiresAt: new Date(Date.now() - 1000) } });
      expect((await refresh(cookie)).status).toBe(401);
    });

    it('refuses an admin token on the customer route', async () => {
      const raw = (await login()).split('=')[1];
      const response = await fetch(customerUrl('/refresh'), withCookie(`kadai_customer_refresh=${raw}`));
      expect(response.status).toBe(401);
    });

    it('ends the session of a deactivated user', async () => {
      const input = newCustomer();
      const cookie = cookieFrom(await fetch(customerUrl('/register'), json(input)));
      await users().updateOne({ email: input.email }, { $set: { isActive: false } });

      const response = await fetch(customerUrl('/refresh'), withCookie(cookie));
      expect(response.status).toBe(401);
      expect(await tokens().countDocuments({ revokedAt: null })).toBe(0);
    });
  });

  describe('logout', () => {
    it('ends the session and clears the cookie', async () => {
      const cookie = cookieFrom(await fetch(adminUrl('/login'), json(ADMIN)));
      const response = await fetch(adminUrl('/logout'), withCookie(cookie));

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true, data: { loggedOut: true } });
      expect(response.headers.getSetCookie()[0]).toContain('kadai_admin_refresh=;');
      expect((await fetch(adminUrl('/refresh'), withCookie(cookie))).status).toBe(401);
    });

    it('ends a token from later in the chain too', async () => {
      const first = cookieFrom(await fetch(adminUrl('/login'), json(ADMIN)));
      const second = cookieFrom(await fetch(adminUrl('/refresh'), withCookie(first)));
      await fetch(adminUrl('/logout'), withCookie(second));

      expect((await fetch(adminUrl('/refresh'), withCookie(second))).status).toBe(401);
    });

    it('is safe when already logged out', async () => {
      expect((await fetch(customerUrl('/logout'), { method: 'POST' })).status).toBe(200);
    });
  });
});

describe('auth rate limiting', () => {
  const database = `kadai_auth_rate_test_${process.pid}`;
  let test: TestApp;

  beforeAll(async () => {
    setEnv(3);
    test = await createAuthApp(database);
  });

  afterAll(async () => {
    await dropTestDatabase(test.app.get<Connection>(getConnectionToken()));
    await test.close();
  });

  it('blocks repeated login attempts with the shared error format', async () => {
    const attempt = () => fetch(test.url('/auth/admin/login'), json({ ...ADMIN, password: 'wrong-password' }));

    for (let i = 0; i < 3; i += 1) expect((await attempt()).status).toBe(401);

    const blocked = await attempt();
    const body = (await blocked.json()) as ApiFailure;
    expect(blocked.status).toBe(429);
    expect(body.error.message).toBe('Too many attempts. Try again in a minute.');
  });

  it('does not rate limit refresh, which runs on every page load', async () => {
    const statuses = await Promise.all(
      Array.from({ length: 6 }, () => fetch(test.url('/auth/admin/refresh'), { method: 'POST' })),
    );
    expect(statuses.every((response) => response.status === 200)).toBe(true);
  });
});
