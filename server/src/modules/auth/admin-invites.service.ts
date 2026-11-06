import crypto from 'node:crypto';
import {
  type AdminInvite as IAdminInvite,
  type AdminInviteStatus,
  type AuthUser,
  canAssignRole,
  type Paginated,
  type StaffRole,
  type UserProfile,
} from '@kadai/shared';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/app.config.js';
import { toUserProfile } from '../users/to-auth-user.js';
import { MailService } from '../mail/mail.service.js';
import type { User } from '../users/user.schema.js';
import { UsersRepository } from '../users/users.repository.js';
import { AdminInvite } from './admin-invite.schema.js';
import { AdminInvitesRepository } from './admin-invites.repository.js';
import { AuthService, type IssuedSession } from './auth.service.js';
import type { AcceptAdminInviteDto } from './dto/accept-admin-invite.dto.js';
import type { AdminInviteListQueryDto } from './dto/admin-invite-list-query.dto.js';
import type { CreateAdminInviteDto } from './dto/create-admin-invite.dto.js';
import type { StaffListQueryDto } from './dto/staff-list-query.dto.js';
import { PasswordService } from './password.service.js';

const INVITE_EXPIRATION_HOURS = 48;
const ONE_HOUR_MS = 60 * 60 * 1000;
const HIGHER_ROLE_MESSAGE = "You can't give someone a higher role than your own.";
const LAST_SUPER_ADMIN_MESSAGE = 'Keep at least one active Super Admin, so someone always has full access.';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function computeStatus(invite: AdminInvite): AdminInviteStatus {
  if (invite.acceptedAt) return 'accepted';
  if (new Date(invite.expiresAt).getTime() < Date.now()) return 'expired';
  return 'pending';
}

@Injectable()
export class AdminInvitesService {
  constructor(
    private readonly invites: AdminInvitesRepository,
    private readonly users: UsersRepository,
    private readonly mail: MailService,
    private readonly passwords: PasswordService,
    private readonly auth: AuthService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async createInvite(admin: AuthUser, dto: CreateAdminInviteDto): Promise<IAdminInvite> {
    const email = dto.email.trim().toLowerCase();
    const staffRole = dto.staffRole ?? 'admin';

    if (!canAssignRole(admin.staffRole, staffRole)) {
      throw new ForbiddenException(HIGHER_ROLE_MESSAGE);
    }

    if (await this.users.exists(email, 'admin')) {
      throw new ConflictException({
        message: 'An administrator with this email already exists',
        fields: { email: ['An administrator with this email already exists'] },
      });
    }

    // If there's an existing pending invite for this email, replace it with a fresh one.
    const existing = await this.invites.findPendingByEmail(email);
    if (existing) {
      await this.invites.deleteById(existing._id);
    }

    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + INVITE_EXPIRATION_HOURS * ONE_HOUR_MS);

    const invite = await this.invites.create({
      email,
      tokenHash,
      invitedBy: admin.id,
      staffRole,
      expiresAt,
      acceptedAt: null,
    });

    const adminAppUrl = this.config.get('adminAppUrl', { infer: true });
    const inviteUrl = `${adminAppUrl}/accept-invite?token=${token}`;

    await this.mail.sendAdminInvite({
      toEmail: email,
      inviteUrl,
      inviterName: admin.name,
    });

    return this.toResponse(invite, admin.name);
  }

  async listAdmins(query: StaffListQueryDto): Promise<Paginated<UserProfile>> {
    const page = await this.users.findStaffPage(query);
    return { ...page, items: page.items.map(toUserProfile) };
  }

  async listInvites(query: AdminInviteListQueryDto): Promise<Paginated<IAdminInvite>> {
    const { items, ...page } = await this.invites.findInvitePage(query);
    // Enrich with inviter names
    const inviterIds = [...new Set(items.map((i) => i.invitedBy))];
    const inviterMap = new Map<string, string>();

    await Promise.all(
      inviterIds.map(async (id) => {
        const inviter = await this.users.findById(id);
        if (inviter) inviterMap.set(id, inviter.name);
      }),
    );

    return { ...page, items: items.map((invite) => this.toResponse(invite, inviterMap.get(invite.invitedBy))) };
  }

  async resendInvite(id: string, admin: AuthUser): Promise<IAdminInvite> {
    const invite = await this.invites.findByIdOrThrow(id);

    if (invite.acceptedAt) {
      throw new BadRequestException('This invitation has already been accepted');
    }

    if (invite.staffRole && !canAssignRole(admin.staffRole, invite.staffRole)) {
      throw new ForbiddenException(HIGHER_ROLE_MESSAGE);
    }

    const token = generateSecureToken();
    invite.tokenHash = hashToken(token);
    invite.expiresAt = new Date(Date.now() + INVITE_EXPIRATION_HOURS * ONE_HOUR_MS);
    await invite.save();

    const adminAppUrl = this.config.get('adminAppUrl', { infer: true });
    const inviteUrl = `${adminAppUrl}/accept-invite?token=${token}`;

    await this.mail.sendAdminInvite({
      toEmail: invite.email,
      inviteUrl,
      inviterName: admin.name,
    });

    return this.toResponse(invite, admin.name);
  }

  async revokeInvite(id: string): Promise<{ revoked: boolean }> {
    const invite = await this.invites.findByIdOrThrow(id);

    if (invite.acceptedAt) {
      throw new BadRequestException('Cannot revoke an invitation that has already been accepted');
    }

    await this.invites.deleteById(id);
    return { revoked: true };
  }

  async validateToken(token: string): Promise<{ email: string; valid: boolean; staffRole?: StaffRole }> {
    const tokenHash = hashToken(token);
    const invite = await this.invites.findByTokenHash(tokenHash);

    if (!invite || invite.acceptedAt || new Date(invite.expiresAt).getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired invitation link');
    }

    return { email: invite.email, valid: true, staffRole: invite.staffRole };
  }

  async acceptInvite(dto: AcceptAdminInviteDto): Promise<IssuedSession> {
    const tokenHash = hashToken(dto.token);
    const invite = await this.invites.findByTokenHash(tokenHash);

    if (!invite || invite.acceptedAt || new Date(invite.expiresAt).getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired invitation link');
    }

    if (await this.users.exists(invite.email, 'admin')) {
      throw new ConflictException('An administrator with this email already exists');
    }

    const passwordHash = await this.passwords.hash(dto.password);

    const user = await this.users.create({
      name: dto.name,
      email: invite.email,
      phone: dto.phone,
      passwordHash,
      role: 'admin',
      staffRole: invite.staffRole ?? 'admin',
    });

    await this.invites.markAccepted(invite._id);

    return this.auth.startSession(user);
  }

  async updateUserRole(id: string, staffRole: StaffRole, _requestedBy: AuthUser): Promise<UserProfile> {
    const user = await this.users.findById(id);
    if (!user || user.role !== 'admin') {
      throw new NotFoundException('Administrator account not found');
    }

    if (staffRole !== 'super_admin') await this.assertNotLastSuperAdmin(user);

    const updated = await this.users.updateStaffRole(id, staffRole);
    if (!updated) {
      throw new NotFoundException('Administrator account not found');
    }

    return toUserProfile(updated);
  }

  async updateUserStatus(id: string, isActive: boolean, requestedBy: AuthUser): Promise<UserProfile> {
    if (requestedBy.id === id && !isActive) {
      throw new BadRequestException('You cannot deactivate your own administrator account');
    }

    const user = await this.users.findById(id);
    if (!user || user.role !== 'admin') {
      throw new NotFoundException('Administrator account not found');
    }

    if (!isActive) await this.assertNotLastSuperAdmin(user);

    const updated = await this.users.updateStatus(id, isActive);
    if (!updated) {
      throw new NotFoundException('Administrator account not found');
    }

    return toUserProfile(updated);
  }

  async deleteUser(id: string, requestedBy: AuthUser): Promise<{ deleted: boolean }> {
    if (requestedBy.id === id) {
      throw new BadRequestException('You cannot delete your own administrator account');
    }

    const user = await this.users.findById(id);
    if (!user || user.role !== 'admin') {
      throw new NotFoundException('Administrator account not found');
    }

    await this.assertNotLastSuperAdmin(user);

    await this.users.deleteById(id);
    return { deleted: true };
  }

  /** Without a Super Admin, nobody could change roles or remove accounts any more. */
  private async assertNotLastSuperAdmin(user: User): Promise<void> {
    if (user.staffRole !== 'super_admin' || user.isActive === false) return;

    if ((await this.users.countActiveSuperAdmins()) <= 1) {
      throw new BadRequestException(LAST_SUPER_ADMIN_MESSAGE);
    }
  }

  private toResponse(invite: AdminInvite, invitedByName?: string): IAdminInvite {
    return {
      id: invite._id,
      email: invite.email,
      invitedBy: invite.invitedBy,
      invitedByName,
      staffRole: invite.staffRole,
      status: computeStatus(invite),
      expiresAt: invite.expiresAt.toISOString(),
      acceptedAt: invite.acceptedAt ? invite.acceptedAt.toISOString() : undefined,
      createdAt: invite.createdAt.toISOString(),
    };
  }
}
