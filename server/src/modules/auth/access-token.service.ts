import type { AuthRole } from '@kadai/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_TTL_SECONDS, JWT_ISSUER } from './auth.constants.js';

export interface AccessTokenClaims {
  /** The user's ID. */
  sub: string;
  role: AuthRole;
}

/** Short-lived JWTs sent with API calls. Guards use verify in item 9 of Phase 2. */
@Injectable()
export class AccessTokenService {
  constructor(private readonly jwt: JwtService) {}

  sign(claims: AccessTokenClaims): Promise<string> {
    return this.jwt.signAsync(claims, {
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      issuer: JWT_ISSUER,
      audience: claims.role,
      algorithm: 'HS256',
    });
  }

  /** Accepts a token only for the expected role, so a customer token can't be used on admin routes. */
  async verify(token: string, role: AuthRole): Promise<AccessTokenClaims> {
    try {
      const { sub, role: tokenRole } = await this.jwt.verifyAsync<AccessTokenClaims>(token, {
        issuer: JWT_ISSUER,
        audience: role,
        algorithms: ['HS256'],
      });
      return { sub, role: tokenRole };
    } catch {
      throw new UnauthorizedException('Your session has expired. Log in again.');
    }
  }
}
