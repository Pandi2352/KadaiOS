import type { AdminInvite, AuthSession, AuthUser, UserProfile } from '@kadai/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { UuidParam } from '../../common/decorators/uuid-param.decorator.js';
import { ApiEndpoint } from '../../common/swagger/api-endpoint.decorator.js';
import { toUserProfile } from '../users/to-auth-user.js';
import { UsersRepository } from '../users/users.repository.js';
import { ProfileResponseDto } from '../users/dto/profile-response.dto.js';
import { AdminInvitesService } from './admin-invites.service.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { Roles } from './decorators/roles.decorator.js';
import { AcceptAdminInviteDto } from './dto/accept-admin-invite.dto.js';
import {
  AdminInviteResponseDto,
  RevokeAdminInviteResponseDto,
  ValidateAdminInviteResponseDto,
} from './dto/admin-invite-response.dto.js';
import { AuthSessionDto } from './dto/auth-response.dto.js';
import { CreateAdminInviteDto } from './dto/create-admin-invite.dto.js';
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto.js';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto.js';

@ApiTags('Admin invites')
@Controller('auth/admin/invites')
export class AdminInvitesController {
  constructor(
    private readonly invites: AdminInvitesService,
    private readonly users: UsersRepository,
    private readonly cookies: AuthCookieService,
  ) {}

  @Post()
  @Roles('admin')
  @UseGuards(ThrottlerGuard)
  @ApiEndpoint({
    summary: 'Invite a new administrator via email',
    response: AdminInviteResponseDto,
    status: HttpStatus.CREATED,
    validates: true,
  })
  async create(@CurrentUser() admin: AuthUser, @Body() dto: CreateAdminInviteDto): Promise<AdminInvite> {
    return this.invites.createInvite(admin, dto);
  }

  @Get()
  @Roles('admin')
  @ApiEndpoint({
    summary: 'List all administrator invites',
    response: AdminInviteResponseDto,
    isArray: true,
  })
  async list(): Promise<AdminInvite[]> {
    return this.invites.listInvites();
  }

  @Get('admins')
  @Roles('admin')
  @ApiEndpoint({
    summary: 'List all current administrator accounts',
    response: ProfileResponseDto,
    isArray: true,
  })
  async listAdmins(): Promise<UserProfile[]> {
    const admins = await this.users.findAdmins();
    return admins.map(toUserProfile);
  }

  @Patch('users/:id/role')
  @Roles('admin')
  @ApiEndpoint({
    summary: 'Update an administrator account staff role',
    response: ProfileResponseDto,
    uuidParam: 'id',
    validates: true,
  })
  async updateRole(
    @CurrentUser() admin: AuthUser,
    @UuidParam() id: string,
    @Body() dto: UpdateStaffRoleDto,
  ): Promise<UserProfile> {
    return this.invites.updateUserRole(id, dto.staffRole, admin);
  }

  @Patch('users/:id/status')
  @Roles('admin')
  @ApiEndpoint({
    summary: 'Toggle active or deactivated status for an administrator',
    response: ProfileResponseDto,
    uuidParam: 'id',
    validates: true,
  })
  async updateStatus(
    @CurrentUser() admin: AuthUser,
    @UuidParam() id: string,
    @Body() dto: UpdateStaffStatusDto,
  ): Promise<UserProfile> {
    return this.invites.updateUserStatus(id, dto.isActive, admin);
  }

  @Delete('users/:id')
  @Roles('admin')
  @ApiEndpoint({
    summary: 'Delete an administrator account',
    response: RevokeAdminInviteResponseDto,
    uuidParam: 'id',
  })
  async deleteUser(@CurrentUser() admin: AuthUser, @UuidParam() id: string): Promise<{ deleted: boolean }> {
    return this.invites.deleteUser(id, admin);
  }

  @Post(':id/resend')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(ThrottlerGuard)
  @ApiEndpoint({
    summary: 'Resend an administrator invite email',
    response: AdminInviteResponseDto,
    uuidParam: 'id',
  })
  async resend(@CurrentUser() admin: AuthUser, @UuidParam() id: string): Promise<AdminInvite> {
    return this.invites.resendInvite(id, admin);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiEndpoint({
    summary: 'Revoke a pending administrator invite',
    response: RevokeAdminInviteResponseDto,
    uuidParam: 'id',
  })
  async revoke(@UuidParam() id: string): Promise<{ revoked: boolean }> {
    return this.invites.revokeInvite(id);
  }

  @Public()
  @Get('validate')
  @ApiEndpoint({
    summary: 'Validate an invite token from an email link',
    response: ValidateAdminInviteResponseDto,
  })
  async validate(@Query('token') token: string): Promise<{ email: string; valid: boolean }> {
    return this.invites.validateToken(token);
  }

  @Public()
  @Post('accept')
  @UseGuards(ThrottlerGuard)
  @ApiEndpoint({
    summary: 'Accept an invitation and register administrator account',
    response: AuthSessionDto,
    status: HttpStatus.CREATED,
    validates: true,
  })
  async accept(
    @Body() dto: AcceptAdminInviteDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSession> {
    const issued = await this.invites.acceptInvite(dto);
    this.cookies.set(response, 'admin', issued.refreshToken);
    return issued.session;
  }
}
