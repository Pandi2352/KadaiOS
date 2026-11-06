import { type ApiFailure, type ApiSuccess, type AuthSession, generateUuid } from '@kadai/shared';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { appConfig } from '../../config/app.config.js';
import { createTestApp, dropTestDatabase, type TestApp } from '../../test/create-test-app.js';
import { MailService } from '../mail/mail.service.js';
import { AuthModule } from './auth.module.js';

const TEST_DB = `kadai_invites_test_${process.pid}`;
const ADMIN = { email: 'admin@kadaios.test', password: 'Admin@12345' };

const json = (method: string, body?: unknown, token?: string): RequestInit => ({
  method,
  headers: {
    'content-type': 'application/json',
    ...(token && { authorization: `Bearer ${token}` }),
  },
  ...(body !== undefined && { body: JSON.stringify(body) }),
});

function setEnv() {
  Object.assign(process.env, {
    JWT_ACCESS_SECRET: 'test-secret-'.repeat(4),
    AUTH_RATE_LIMIT: '100',
    DEFAULT_ADMIN_EMAIL: ADMIN.email,
    DEFAULT_ADMIN_PASSWORD: ADMIN.password,
    ADMIN_APP_URL: 'http://localhost:3000',
  });
}

describe('Admin Invites (E2E)', () => {
  let testApp: TestApp;
  let connection: Connection;
  let adminToken: string;
  let sentInviteUrl = '';

  beforeAll(async () => {
    setEnv();
    testApp = await createTestApp({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [appConfig] }),
        MongooseModule.forRoot(`mongodb://localhost:27017/${TEST_DB}`),
        AuthModule,
      ],
    });
    connection = testApp.app.get<Connection>(getConnectionToken());

    // Mock MailService.sendAdminInvite to capture inviteUrl
    const mailService = testApp.app.get(MailService);
    vi.spyOn(mailService, 'sendAdminInvite').mockImplementation(async (opts) => {
      sentInviteUrl = opts.inviteUrl;
    });

    // Log in as default admin to get adminToken
    const res = await fetch(testApp.url('/auth/admin/login'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(ADMIN),
    });
    const data = ((await res.json()) as ApiSuccess<AuthSession>).data;
    adminToken = data.accessToken;
  });

  afterAll(async () => {
    if (connection) {
      await dropTestDatabase(connection);
    }
    if (testApp) {
      await testApp.close();
    }
  });

  it('rejects unauthenticated requests to create an invite', async () => {
    const res = await fetch(testApp.url('/auth/admin/invites'), json('POST', { email: 'newadmin@example.com' }));
    expect(res.status).toBe(401);
  });

  it('refuses to invite an email that is already an admin', async () => {
    const res = await fetch(testApp.url('/auth/admin/invites'), json('POST', { email: ADMIN.email }, adminToken));
    expect(res.status).toBe(409);
    const body = (await res.json()) as ApiFailure;
    expect(body.error.message).toContain('An administrator with this email already exists');
  });

  it('creates an invite and sends an email', async () => {
    const newAdminEmail = `invitee-${generateUuid()}@example.com`;
    const res = await fetch(testApp.url('/auth/admin/invites'), json('POST', { email: newAdminEmail }, adminToken));

    expect(res.status).toBe(201);
    const body = (await res.json()) as ApiSuccess<{ id: string; email: string; status: string }>;
    expect(body.data.email).toBe(newAdminEmail);
    expect(body.data.status).toBe('pending');
    expect(sentInviteUrl).toContain('http://localhost:3000/accept-invite?token=');
  });

  it('lists admin invites and existing admins', async () => {
    const listRes = await fetch(testApp.url('/auth/admin/invites'), {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(listRes.status).toBe(200);
    const listBody = (await listRes.json()) as ApiSuccess<unknown[]>;
    expect(listBody.data.length).toBeGreaterThan(0);

    const adminsRes = await fetch(testApp.url('/auth/admin/invites/admins'), {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(adminsRes.status).toBe(200);
    const adminsBody = (await adminsRes.json()) as ApiSuccess<Array<{ email: string; role: string }>>;
    expect(adminsBody.data.some((a) => a.email === ADMIN.email)).toBe(true);
  });

  it('validates a valid invite token from URL', async () => {
    const token = new URL(sentInviteUrl).searchParams.get('token')!;
    const res = await fetch(testApp.url(`/auth/admin/invites/validate?token=${token}`));
    expect(res.status).toBe(200);
    const body = (await res.json()) as ApiSuccess<{ email: string; valid: boolean }>;
    expect(body.data.valid).toBe(true);
  });

  it('fails validation for a bogus token', async () => {
    const res = await fetch(testApp.url('/auth/admin/invites/validate?token=non-existent-token'));
    expect(res.status).toBe(400);
  });

  it('accepts an invitation, creates an admin account, and logs in', async () => {
    const token = new URL(sentInviteUrl).searchParams.get('token')!;
    const newAdminPassword = 'NewAdminPassword@123';

    const res = await fetch(testApp.url('/auth/admin/invites/accept'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token,
        name: 'Invited Colleague',
        password: newAdminPassword,
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as ApiSuccess<AuthSession>;
    expect(body.data.user.role).toBe('admin');
    expect(body.data.user.name).toBe('Invited Colleague');
    expect(body.data.accessToken).toBeDefined();

    // Verify Set-Cookie header contains refresh token
    const cookies = res.headers.getSetCookie();
    expect(cookies.some((c) => c.startsWith('kadai_admin_refresh='))).toBe(true);

    // Verify the new admin can log in with their credentials
    const loginRes = await fetch(testApp.url('/auth/admin/login'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: body.data.user.email,
        password: newAdminPassword,
      }),
    });
    expect(loginRes.status).toBe(200);

    // Verifying token cannot be used a second time
    const secondRes = await fetch(testApp.url('/auth/admin/invites/accept'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token,
        name: 'Another Name',
        password: newAdminPassword,
      }),
    });
    expect(secondRes.status).toBe(400);
  });

  it('allows resending and revoking an invite', async () => {
    const testEmail = `to-revoke-${generateUuid()}@example.com`;
    const createRes = await fetch(testApp.url('/auth/admin/invites'), json('POST', { email: testEmail }, adminToken));
    const invite = ((await createRes.json()) as ApiSuccess<{ id: string }>).data;

    // Resend
    const resendRes = await fetch(testApp.url(`/auth/admin/invites/${invite.id}/resend`), json('POST', {}, adminToken));
    expect(resendRes.status).toBe(200);

    // Revoke
    const revokeRes = await fetch(
      testApp.url(`/auth/admin/invites/${invite.id}`),
      json('DELETE', undefined, adminToken),
    );
    expect(revokeRes.status).toBe(200);

    // Trying to resend revoked invite fails with 404
    const notFoundRes = await fetch(
      testApp.url(`/auth/admin/invites/${invite.id}/resend`),
      json('POST', {}, adminToken),
    );
    expect(notFoundRes.status).toBe(404);
  });
});
