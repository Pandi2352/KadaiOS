import type { AuthRole, AuthSession } from '@kadai/shared';
import { Body, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { ApiEndpoint } from '../../common/swagger/api-endpoint.decorator.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { AuthService, INVALID_LOGIN_MESSAGE, type IssuedSession } from './auth.service.js';
import { AuthSessionDto, LogoutResponseDto } from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { SESSION_ENDED_MESSAGE } from './refresh-token.service.js';

/** The routes admins and customers share. Each subclass fixes the role, so the two never mix. */
export abstract class SessionAuthController {
  protected constructor(
    protected readonly auth: AuthService,
    protected readonly cookies: AuthCookieService,
    private readonly role: AuthRole,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiEndpoint({
    summary: 'Log in',
    description: 'Returns an access token and sets the refresh token in an httpOnly cookie.',
    response: AuthSessionDto,
    validates: true,
    unauthorized: INVALID_LOGIN_MESSAGE,
    rateLimited: true,
  })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<AuthSession> {
    return this.deliver(response, await this.auth.login(this.role, dto));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    summary: 'Get a new access token',
    description:
      'Uses the refresh token cookie and replaces it, because each refresh token works only once. Returns null when there is no cookie, which means nobody is logged in.',
    response: AuthSessionDto,
    nullable: true,
    unauthorized: SESSION_ENDED_MESSAGE,
  })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<AuthSession | null> {
    const token = this.cookies.read(request, this.role);
    if (!token) return null;

    try {
      return this.deliver(response, await this.auth.refresh(this.role, token));
    } catch (error) {
      if (error instanceof UnauthorizedException) this.cookies.clear(response, this.role);
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    summary: 'Log out',
    description: 'Ends this login and clears the cookie. Safe to call when already logged out.',
    response: LogoutResponseDto,
  })
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<LogoutResponseDto> {
    const token = this.cookies.read(request, this.role);
    if (token) await this.auth.logout(token);

    this.cookies.clear(response, this.role);
    return { loggedOut: true };
  }

  protected deliver(response: Response, { session, refreshToken }: IssuedSession): AuthSession {
    this.cookies.set(response, session.user.role, refreshToken);
    return session;
  }
}
