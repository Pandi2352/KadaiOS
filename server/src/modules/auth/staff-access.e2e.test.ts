import {
  type ApiSuccess,
  type AuthSession,
  generateUuid,
  hasPermission,
  type Paginated,
  type Permission,
  STAFF_ROLES,
  type StaffRole,
  type UserProfile,
} from '@kadai/shared';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { appConfig } from '../../config/app.config.js';
import { createTestApp, dropTestDatabase, type TestApp } from '../../test/create-test-app.js';
import { MailService } from '../mail/mail.service.js';
import { DefaultUsersService } from '../users/default-users.service.js';
import { AuthModule } from './auth.module.js';
import { PasswordService } from './password.service.js';

const PASSWORD = 'a-long-password';

describe('staff access', () => {
  let test: TestApp;
  let connection: Connection;
  let passwordHash: string;

  const users = () => connection.collection('users');

  const request = (method: string, path: string, token?: string, body?: unknown) =>
    fetch(test.url(path), {
      method,
      headers: {
        'content-type': 'application/json',
        ...(token && { authorization: `Bearer ${token}` }),
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });

  const addUser = async (staffRole: StaffRole | undefined, overrides: Record<string, unknown> = {}) => {
    const _id = generateUuid();
    const email = `staff-${_id}@kadaios.test`;
    const now = new Date();
    await users().insertOne({
      _id: _id as never,
      name: `Person ${staffRole ?? 'no role'}`,
      email,
      passwordHash,
      role: 'admin',
      isActive: true,
      ...(staffRole && { staffRole }),
      createdAt: now,
      updatedAt: now,
      ...overrides,
    });
    return { id: _id, email };
  };

  const tokenFor = async (staffRole: StaffRole) => {
    const { email } = await addUser(staffRole);
    const response = await request('POST', '/auth/admin/login', undefined, { email, password: PASSWORD });
    return ((await response.json()) as ApiSuccess<AuthSession>).data.accessToken;
  };

  beforeAll(async () => {
    Object.assign(process.env, {
      JWT_ACCESS_SECRET: 'test-secret-'.repeat(4),
      AUTH_RATE_LIMIT: '100000',
      DEFAULT_ADMIN_EMAIL: 'admin@kadaios.test',
      DEFAULT_ADMIN_PASSWORD: 'Admin@12345',
    });
    test = await createTestApp({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [appConfig] }),
        MongooseModule.forRoot(`mongodb://localhost:27017/kadai_staff_access_test_${process.pid}`),
        AuthModule,
      ],
    });
    connection = test.app.get<Connection>(getConnectionToken());
    passwordHash = await test.app.get(PasswordService, { strict: false }).hash(PASSWORD);
    vi.spyOn(test.app.get(MailService), 'sendAdminInvite').mockResolvedValue();
  });

  afterAll(async () => {
    await dropTestDatabase(connection);
    await test.close();
  });

  describe('each role can only do what its permissions allow', () => {
    const ACTIONS: [string, Permission, (token: string) => Promise<Response>][] = [
      ['list staff', 'users:view', (token) => request('GET', '/auth/admin/invites/admins', token)],
      ['list invites', 'users:view', (token) => request('GET', '/auth/admin/invites', token)],
      [
        'invite',
        'users:invite',
        (token) =>
          request('POST', '/auth/admin/invites', token, { email: `${generateUuid()}@b.co`, staffRole: 'viewer' }),
      ],
      [
        'change a role',
        'users:manage_roles',
        async (token) =>
          request('PATCH', `/auth/admin/invites/users/${(await addUser('viewer')).id}/role`, token, {
            staffRole: 'staff',
          }),
      ],
      [
        'deactivate',
        'users:delete',
        async (token) =>
          request('PATCH', `/auth/admin/invites/users/${(await addUser('viewer')).id}/status`, token, {
            isActive: false,
          }),
      ],
      [
        'delete',
        'users:delete',
        async (token) => request('DELETE', `/auth/admin/invites/users/${(await addUser('viewer')).id}`, token),
      ],
    ];

    const CASES = STAFF_ROLES.flatMap((staffRole) =>
      ACTIONS.map(([label, permission, action]) => ({
        staffRole,
        label,
        action,
        allowed: hasPermission({ role: 'admin', staffRole }, permission),
      })),
    );

    it.each(CASES)('$staffRole: $label allowed is $allowed', async ({ staffRole, action, allowed }) => {
      const response = await action(await tokenFor(staffRole));

      if (allowed) expect(response.status).toBeLessThan(300);
      else expect(response.status).toBe(403);
    });

    it('refuses an admin with no staff role', async () => {
      const { email } = await addUser(undefined);
      const login = await request('POST', '/auth/admin/login', undefined, { email, password: PASSWORD });
      const { accessToken } = ((await login.json()) as ApiSuccess<AuthSession>).data;

      expect((await request('GET', '/auth/admin/invites/admins', accessToken)).status).toBe(403);
    });

    it('applies a role change straight away, without a new login', async () => {
      const person = await addUser('admin');
      const login = await request('POST', '/auth/admin/login', undefined, { email: person.email, password: PASSWORD });
      const { accessToken } = ((await login.json()) as ApiSuccess<AuthSession>).data;
      expect((await request('GET', '/auth/admin/invites/admins', accessToken)).status).toBe(200);

      await users().updateOne({ _id: person.id as never }, { $set: { staffRole: 'viewer' } });

      expect((await request('GET', '/auth/admin/invites/admins', accessToken)).status).toBe(403);
    });

    it('stops a viewer promoting themselves', async () => {
      const viewer = await addUser('viewer');
      const login = await request('POST', '/auth/admin/login', undefined, { email: viewer.email, password: PASSWORD });
      const { accessToken } = ((await login.json()) as ApiSuccess<AuthSession>).data;

      const response = await request('PATCH', `/auth/admin/invites/users/${viewer.id}/role`, accessToken, {
        staffRole: 'super_admin',
      });

      expect(response.status).toBe(403);
      expect((await users().findOne({ _id: viewer.id as never }))?.staffRole).toBe('viewer');
    });
  });

  describe('invitations can not hand out more access than the inviter has', () => {
    it('lets an administrator invite their own role and below, but not a super admin', async () => {
      const token = await tokenFor('admin');
      const invite = (staffRole: StaffRole) =>
        request('POST', '/auth/admin/invites', token, { email: `${generateUuid()}@b.co`, staffRole });

      expect((await invite('admin')).status).toBe(201);
      expect((await invite('viewer')).status).toBe(201);
      expect((await invite('super_admin')).status).toBe(403);
    });

    it('stops an administrator resending a super admin invitation', async () => {
      const created = await request('POST', '/auth/admin/invites', await tokenFor('super_admin'), {
        email: `${generateUuid()}@b.co`,
        staffRole: 'super_admin',
      });
      const { id } = ((await created.json()) as ApiSuccess<{ id: string }>).data;

      expect((await request('POST', `/auth/admin/invites/${id}/resend`, await tokenFor('admin'))).status).toBe(403);
    });
  });

  describe('there is always an active super admin', () => {
    let actor: { id: string; token: string };

    beforeEach(async () => {
      await users().deleteMany({ staffRole: 'super_admin' });
      const { id, email } = await addUser('super_admin');
      const login = await request('POST', '/auth/admin/login', undefined, { email, password: PASSWORD });
      actor = { id, token: ((await login.json()) as ApiSuccess<AuthSession>).data.accessToken };
    });

    it('refuses to demote the last one', async () => {
      const response = await request('PATCH', `/auth/admin/invites/users/${actor.id}/role`, actor.token, {
        staffRole: 'viewer',
      });

      expect(response.status).toBe(400);
      expect((await users().findOne({ _id: actor.id as never }))?.staffRole).toBe('super_admin');
    });

    it('allows a demotion while another active one remains', async () => {
      await addUser('super_admin');

      const response = await request('PATCH', `/auth/admin/invites/users/${actor.id}/role`, actor.token, {
        staffRole: 'viewer',
      });

      expect(response.status).toBe(200);
    });

    it('does not count a deactivated one as remaining', async () => {
      await addUser('super_admin', { isActive: false });

      const response = await request('PATCH', `/auth/admin/invites/users/${actor.id}/role`, actor.token, {
        staffRole: 'viewer',
      });

      expect(response.status).toBe(400);
    });

    it('lets a super admin be removed while they are not the last active one', async () => {
      const other = await addUser('super_admin');

      expect(
        (await request('PATCH', `/auth/admin/invites/users/${other.id}/status`, actor.token, { isActive: false }))
          .status,
      ).toBe(200);
      // A deactivated one isn't holding up the rule, so it can go.
      expect((await request('DELETE', `/auth/admin/invites/users/${other.id}`, actor.token)).status).toBe(200);
    });

    it('still refuses removing yourself', async () => {
      expect((await request('DELETE', `/auth/admin/invites/users/${actor.id}`, actor.token)).status).toBe(400);
      expect(
        (await request('PATCH', `/auth/admin/invites/users/${actor.id}/status`, actor.token, { isActive: false }))
          .status,
      ).toBe(400);
    });
  });

  describe('admins from before staff roles', () => {
    it('get the super admin role at startup, and keep existing roles untouched', async () => {
      const legacy = await addUser(undefined);
      const viewer = await addUser('viewer');

      await test.app.get(DefaultUsersService, { strict: false }).onApplicationBootstrap();

      expect((await users().findOne({ _id: legacy.id as never }))?.staffRole).toBe('super_admin');
      expect((await users().findOne({ _id: viewer.id as never }))?.staffRole).toBe('viewer');
    });
  });

  describe('listing staff', () => {
    let token: string;
    const tag = `list${Date.now()}`;

    const list = async (query: string) => {
      const response = await request('GET', `/auth/admin/invites/admins?${query}`, token);
      return ((await response.json()) as ApiSuccess<Paginated<UserProfile>>).data;
    };

    beforeAll(async () => {
      token = await tokenFor('super_admin');
      for (let index = 0; index < 5; index += 1) {
        await addUser('manager', { name: `${tag} Person ${index}` });
      }
      await addUser('staff', { name: `${tag} Quiet`, isActive: false });
    });

    it('returns one page and the total', async () => {
      const first = await list(`search=${tag}&limit=2&page=1`);
      const last = await list(`search=${tag}&limit=2&page=3`);

      expect(first).toMatchObject({ total: 6, page: 1, limit: 2 });
      expect(first.items).toHaveLength(2);
      expect(last.items).toHaveLength(2);
      expect(first.items[0].id).not.toBe(last.items[0].id);
    });

    it('never sends a password hash', async () => {
      const response = await request('GET', `/auth/admin/invites/admins?search=${tag}`, token);
      expect(await response.text()).not.toContain('passwordHash');
    });

    it('filters by role and status together', async () => {
      expect((await list(`search=${tag}&staffRole=manager`)).total).toBe(5);
      expect((await list(`search=${tag}&status=deactivated`)).total).toBe(1);
      expect((await list(`search=${tag}&staffRole=manager&status=deactivated`)).total).toBe(0);
    });

    it('searches ignoring case, and by role name', async () => {
      expect((await list(`search=${tag.toUpperCase()}%20QUIET`)).total).toBe(1);
      expect((await list('search=shop%20manager&staffRole=manager')).total).toBeGreaterThanOrEqual(5);
    });

    it('treats search text as plain text, not a pattern', async () => {
      expect((await list('search=.*')).total).toBe(0);
    });

    it.each(['limit=0', 'limit=101', 'page=0', 'staffRole=king', 'status=gone'])('refuses %s', async (query) => {
      expect((await request('GET', `/auth/admin/invites/admins?${query}`, token)).status).toBe(400);
    });
  });

  describe('listing invitations', () => {
    it('pages and filters by status', async () => {
      const token = await tokenFor('super_admin');
      const list = async (query: string) =>
        (
          (await (await request('GET', `/auth/admin/invites?${query}`, token)).json()) as ApiSuccess<
            Paginated<{ id: string; status: string }>
          >
        ).data;

      const created = await request('POST', '/auth/admin/invites', token, { email: `${generateUuid()}@b.co` });
      const { id } = ((await created.json()) as ApiSuccess<{ id: string }>).data;
      await request('POST', '/auth/admin/invites', token, { email: `${generateUuid()}@b.co` });
      await connection
        .collection('admin_invites')
        .updateOne({ _id: id as never }, { $set: { expiresAt: new Date(Date.now() - 1000) } });

      expect((await list('limit=1')).items).toHaveLength(1);
      const email = `find-me-${generateUuid()}@b.co`;
      await request('POST', '/auth/admin/invites', token, { email });
      expect((await list(`search=${email.toUpperCase()}`)).total).toBe(1);
      expect((await list('search=.*')).total).toBe(0);
      const expired = await list('status=expired');
      expect(expired.items.some((invite) => invite.id === id)).toBe(true);
      expect(expired.items.every((invite) => invite.status === 'expired')).toBe(true);
      const pending = await list('status=pending&limit=100');
      expect(pending.items.some((invite) => invite.id === id)).toBe(false);
    });
  });
});
