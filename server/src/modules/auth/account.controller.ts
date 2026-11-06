import type { AuthSession, AuthUser } from '@kadai/shared';
import { Body, Controller, Put, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { ApiEndpoint } from '../../common/swagger/api-endpoint.decorator.js';
import { AccountService, EMAIL_IN_USE_MESSAGE } from './account.service.js';
import { AuthCookieService } from './auth-cookie.service.js';
import type { IssuedSession } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Roles } from './decorators/roles.decorator.js';
import { ChangeEmailDto } from './dto/change-email.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { AuthSessionDto } from './dto/auth-response.dto.js';

const LOGS_OUT_OTHERS =
  'Needs the current password. Logs out every other device, and returns a new session for this one.';

/** In the auth module and not with the profile routes, because these also replace the login. */
@Roles()
@ApiTags('Profile')
@Controller('users/me')
@UseGuards(ThrottlerGuard)
export class AccountController {
  constructor(
    private readonly account: AccountService,
    private readonly cookies: AuthCookieService,
  ) {}

  @Put('password')
  @ApiEndpoint({
    summary: 'Change your own password',
    description: LOGS_OUT_OTHERS,
    response: AuthSessionDto,
    validates: true,
    rateLimited: true,
  })
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSession> {
    return this.deliver(response, await this.account.changePassword(user.id, dto));
  }

  @Put('email')
  @ApiEndpoint({
    summary: 'Change your own email',
    description: `${LOGS_OUT_OTHERS} The new email takes effect straight away and is not verified, because the API can't send email yet.`,
    response: AuthSessionDto,
    validates: true,
    conflict: EMAIL_IN_USE_MESSAGE,
    rateLimited: true,
  })
  async changeEmail(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangeEmailDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSession> {
    return this.deliver(response, await this.account.changeEmail(user.id, dto));
  }

  private deliver(response: Response, { session, refreshToken }: IssuedSession): AuthSession {
    this.cookies.set(response, session.user.role, refreshToken);
    return session;
  }
}
