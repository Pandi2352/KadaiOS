import type { ApiFailure, ApiSuccess, AuthSession, AuthUser } from '@kadai/shared';
import { Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { appConfig } from '../../../config/app.config.js';
import { createTestApp, dropTestDatabase, type TestApp } from '../../../test/create-test-app.js';
import { ShopsModule } from '../../shops/shops.module.js';
import { AuthModule } from '../auth.module.js';
import { FORBIDDEN_MESSAGE, JWT_ISSUER, LOGIN_REQUIRED_MESSAGE } from '../auth.constants.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { Public } from '../decorators/public.decorator.js';
import { Roles } from '../decorators/roles.decorator.js';

const ADMIN = { email: 'admin@kadaios.test', password: 'Admin@12345' };
const CUSTOMER = { email: 'customer@kadaios.test', password: 'Customer@12345' };

@Controller('probe')
class ProbeController {
  @Public()
  @Get('public')
  open() {
    return 'open';
  }

  @Get('any-login')
  anyLogin(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Roles('admin')
  @Get('admin')
  admin() {
    return 'admin';
  }

  @Roles('customer')
  @Get('customer')
  customer() {
    return 'customer';
  }

  @Roles('admin', 'customer')
  @Get('both')
  both() {
    return 'both';
  }
}

describe('authentication guards', () => {
  let test: TestApp;
  let connection: Connection;
  let adminToken: string;
  let customerToken: string;

  const get = (path: string, token?: string, scheme = 'Bearer') =>
    fetch(test.url(path), { headers: token ? { authorization: `${scheme} ${token}` } : {} });

  const login = async (role: string, details: object) => {
    const response = await fetch(test.url(`/auth/${role}/login`), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(details),
    });
    return ((await response.json()) as ApiSuccess<AuthSession>).data.accessToken;
  };

  beforeAll(async () => {
    Object.assign(process.env, {
      JWT_ACCESS_SECRET: 'test-secret-'.repeat(4),
      AUTH_RATE_LIMIT: '100000',
      DEFAULT_ADMIN_EMAIL: ADMIN.email,
      DEFAULT_ADMIN_PASSWORD: ADMIN.password,
      DEFAULT_CUSTOMER_EMAIL: CUSTOMER.email,
      DEFAULT_CUSTOMER_PASSWORD: CUSTOMER.password,
    });
    test = await createTestApp({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [appConfig] }),
        MongooseModule.forRoot(`mongodb://localhost:27017/kadai_guards_test_${process.pid}`),
        AuthModule,
        ShopsModule,
      ],
      controllers: [ProbeController],
    });
    connection = test.app.get<Connection>(getConnectionToken());
    adminToken = await login('admin', ADMIN);
    customerToken = await login('customer', CUSTOMER);
  });

  afterAll(async () => {
    await dropTestDatabase(connection);
    await test.close();
  });

  describe('secure by default', () => {
    it('needs a login on a route with no decorator at all', async () => {
      const response = await get('/probe/any-login');
      const body = (await response.json()) as ApiFailure;

      expect(response.status).toBe(401);
      expect(body).toEqual({ success: false, error: { statusCode: 401, message: LOGIN_REQUIRED_MESSAGE } });
    });

    it('leaves @Public() routes open', async () => {
      expect((await get('/probe/public')).status).toBe(200);
    });

    it('ignores a bad token on a public route', async () => {
      expect((await get('/probe/public', 'not-a-token')).status).toBe(200);
    });

    it('leaves login open, because nobody could log in otherwise', async () => {
      expect((await fetch(test.url('/auth/admin/refresh'), { method: 'POST' })).status).toBe(200);
    });
  });

  describe('tokens that must fail with 401', () => {
    const forge = (payload: object, secret: string, options: object = {}) =>
      test.app.get(JwtService, { strict: false }).sign(payload, {
        secret,
        issuer: JWT_ISSUER,
        audience: 'admin',
        expiresIn: 60,
        ...options,
      });

    const userId = async () => {
      const response = await get('/probe/any-login', adminToken);
      return ((await response.json()) as ApiSuccess<AuthUser>).data.id;
    };

    it.each([
      ['garbage', () => 'not-a-token'],
      ['an empty value', () => ''],
    ])('refuses %s', async (_label, token) => {
      expect((await get('/probe/any-login', token() || undefined)).status).toBe(401);
    });

    it('refuses the wrong auth scheme', async () => {
      expect((await get('/probe/any-login', adminToken, 'Basic')).status).toBe(401);
    });

    it('accepts any letter case in the scheme', async () => {
      expect((await get('/probe/any-login', adminToken, 'bearer')).status).toBe(200);
    });

    it('refuses extra parts in the header', async () => {
      expect((await get('/probe/any-login', `${adminToken} extra`)).status).toBe(401);
    });

    it('refuses a tampered token', async () => {
      const [header, , signature] = adminToken.split('.');
      const payload = Buffer.from(JSON.stringify({ sub: 'someone', role: 'admin', aud: 'admin' })).toString(
        'base64url',
      );
      expect((await get('/probe/any-login', `${header}.${payload}.${signature}`)).status).toBe(401);
    });

    it('refuses a customer token edited to claim admin', async () => {
      const [header, payload, signature] = customerToken.split('.');
      const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as object;
      const edited = Buffer.from(JSON.stringify({ ...claims, role: 'admin', aud: 'admin' })).toString('base64url');
      expect((await get('/probe/admin', `${header}.${edited}.${signature}`)).status).toBe(401);
    });

    it('refuses an unsigned token', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({ sub: 'x', role: 'admin', aud: 'admin', iss: JWT_ISSUER })).toString(
        'base64url',
      );
      expect((await get('/probe/admin', `${header}.${payload}.`)).status).toBe(401);
    });

    it('refuses an expired token', async () => {
      const token = forge({ sub: await userId(), role: 'admin' }, process.env.JWT_ACCESS_SECRET as string, {
        expiresIn: -10,
      });
      expect((await get('/probe/any-login', token)).status).toBe(401);
    });

    it('refuses a token signed with another secret', async () => {
      const token = forge({ sub: await userId(), role: 'admin' }, 'another-secret-'.repeat(4));
      expect((await get('/probe/any-login', token)).status).toBe(401);
    });

    it('refuses a token from another issuer', async () => {
      const token = forge({ sub: await userId(), role: 'admin' }, process.env.JWT_ACCESS_SECRET as string, {
        issuer: 'someone-else',
      });
      expect((await get('/probe/any-login', token)).status).toBe(401);
    });

    it('refuses a token whose role disagrees with the database', async () => {
      const response = await get('/probe/any-login', customerToken);
      const { id } = ((await response.json()) as ApiSuccess<AuthUser>).data;
      const token = forge({ sub: id, role: 'admin' }, process.env.JWT_ACCESS_SECRET as string);
      expect((await get('/probe/admin', token)).status).toBe(401);
    });

    it('refuses a token for a user who no longer exists', async () => {
      const token = forge({ sub: 'deleted-user', role: 'admin' }, process.env.JWT_ACCESS_SECRET as string);
      expect((await get('/probe/any-login', token)).status).toBe(401);
    });

    it('refuses a refresh token used as an access token', async () => {
      const response = await fetch(test.url('/auth/admin/login'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(ADMIN),
      });
      const refreshToken = decodeURIComponent(response.headers.getSetCookie()[0].split(';')[0].split('=')[1]);
      expect((await get('/probe/any-login', refreshToken)).status).toBe(401);
    });
  });

  describe('deactivated users', () => {
    it('lose access straight away, even with an unexpired token', async () => {
      const email = `gone-${process.pid}@kadaios.test`;
      const response = await fetch(test.url('/auth/customer/register'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Gone', email, password: 'a-long-password' }),
      });
      const { accessToken } = ((await response.json()) as ApiSuccess<AuthSession>).data;
      expect((await get('/probe/any-login', accessToken)).status).toBe(200);

      await connection.collection('users').updateOne({ email }, { $set: { isActive: false } });

      expect((await get('/probe/any-login', accessToken)).status).toBe(401);
    });
  });

  describe('roles', () => {
    it.each([
      ['/probe/admin', 'admin', 200],
      ['/probe/admin', 'customer', 403],
      ['/probe/customer', 'customer', 200],
      ['/probe/customer', 'admin', 403],
      ['/probe/both', 'admin', 200],
      ['/probe/both', 'customer', 200],
      ['/probe/any-login', 'admin', 200],
      ['/probe/any-login', 'customer', 200],
    ])('%s as %s returns %i', async (path, role, status) => {
      const response = await get(path, role === 'admin' ? adminToken : customerToken);
      expect(response.status).toBe(status);
    });

    it('says "not allowed" with a 403, in the shared error format', async () => {
      const response = await get('/probe/admin', customerToken);
      expect(await response.json()).toEqual({ success: false, error: { statusCode: 403, message: FORBIDDEN_MESSAGE } });
    });

    it('checks the login before the role', async () => {
      expect((await get('/probe/admin')).status).toBe(401);
    });
  });

  describe('@CurrentUser', () => {
    it('gives the route the user, with nothing private', async () => {
      const response = await get('/probe/any-login', adminToken);
      const { data } = (await response.json()) as ApiSuccess<AuthUser>;

      expect(data).toMatchObject({ email: ADMIN.email, role: 'admin', name: 'Default Admin' });
      expect(Object.keys(data).sort()).toEqual(['email', 'id', 'isActive', 'name', 'role', 'staffRole']);
    });
  });

  describe('real routes', () => {
    it('keeps shops for admins only', async () => {
      expect((await get('/shops')).status).toBe(401);
      expect((await get('/shops', customerToken)).status).toBe(403);
      expect((await get('/shops', adminToken)).status).toBe(200);
    });

    it('refuses to create a shop without a login, before reading the body', async () => {
      const response = await fetch(test.url('/shops'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Sneaky', businessType: 'meat' }),
      });
      expect(response.status).toBe(401);
      expect(await connection.collection('shops').countDocuments({})).toBe(0);
    });
  });
});
