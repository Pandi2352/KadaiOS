import type { AdminInvite, AuthSession, AuthUser, Paginated, UserProfile } from '@kadai/shared';
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
import { ProfileResponseDto } from '../users/dto/profile-response.dto.js';
import { AdminInvitesService } from './admin-invites.service.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { RequirePermission } from './decorators/require-permission.decorator.js';
import { AcceptAdminInviteDto } from './dto/accept-admin-invite.dto.js';
import { AdminInviteListQueryDto } from './dto/admin-invite-list-query.dto.js';
import {
  AdminInviteResponseDto,
  RevokeAdminInviteResponseDto,
  ValidateAdminInviteResponseDto,
} from './dto/admin-invite-response.dto.js';
import { AuthSessionDto } from './dto/auth-response.dto.js';
import { CreateAdminInviteDto } from './dto/create-admin-invite.dto.js';
import { StaffListQueryDto } from './dto/staff-list-query.dto.js';
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto.js';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto.js';

@ApiTags('Admin invites')
@Controller('auth/admin/invites')
export class AdminInvitesController {
  constructor(
    private readonly invites: AdminInvitesService,
    private readonly cookies: AuthCookieService,
  ) {}

  @Post()
  @RequirePermission('users:invite')
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
  @RequirePermission('users:view')
  @ApiEndpoint({
    summary: 'List administrator invites, newest first',
    response: AdminInviteResponseDto,
    paginated: true,
    validates: true,
  })
  async list(@Query() query: AdminInviteListQueryDto): Promise<Paginated<AdminInvite>> {
    return this.invites.listInvites(query);
  }

  @Get('admins')
  @RequirePermission('users:view')
  @ApiEndpoint({
    summary: 'List administrator accounts, newest first',
    response: ProfileResponseDto,
    paginated: true,
    validates: true,
  })
  async listAdmins(@Query() query: StaffListQueryDto): Promise<Paginated<UserProfile>> {
    return this.invites.listAdmins(query);
  }

  @Patch('users/:id/role')
  @RequirePermission('users:manage_roles')
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
  @RequirePermission('users:delete')
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
  @RequirePermission('users:delete')
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
  @RequirePermission('users:invite')
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
  @RequirePermission('users:invite')
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
