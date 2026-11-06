import type { AuthRole } from '@kadai/shared';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import type { AppConfig } from '../../config/app.config.js';
import { REFRESH_TOKEN_TTL_MS, refreshCookieName, refreshCookiePath } from './auth.constants.js';

/** httpOnly keeps the refresh token away from page scripts, so a script injection can't steal it. */
@Injectable()
export class AuthCookieService {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  read(request: Request, role: AuthRole): string | undefined {
    const value: unknown = request.cookies?.[refreshCookieName(role)];
    return typeof value === 'string' && value !== '' ? value : undefined;
  }

  set(response: Response, role: AuthRole, token: string): void {
    response.cookie(refreshCookieName(role), token, { ...this.options(role), maxAge: REFRESH_TOKEN_TTL_MS });
  }

  clear(response: Response, role: AuthRole): void {
    response.clearCookie(refreshCookieName(role), this.options(role));
  }

  private options(role: AuthRole): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'strict',
      secure: this.config.get('isProduction', { infer: true }),
      path: refreshCookiePath(role),
    };
  }
}
