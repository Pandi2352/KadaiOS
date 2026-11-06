import { createHash, randomBytes } from 'node:crypto';
import { type AuthRole, generateUuid } from '@kadai/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { REFRESH_REUSE_GRACE_MS, REFRESH_TOKEN_TTL_MS } from './auth.constants.js';
import type { RefreshToken } from './refresh-token.schema.js';
import { RefreshTokensRepository } from './refresh-tokens.repository.js';

export const SESSION_ENDED_MESSAGE = 'Your session has ended. Log in again.';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

interface RotatedToken {
  token: string;
  userId: string;
}

/** Long-lived random tokens, kept in a cookie, that get new access tokens. Each is replaced when used. */
@Injectable()
export class RefreshTokenService {
  constructor(private readonly tokens: RefreshTokensRepository) {}

  /** Starts a new chain for a login, or continues one when rotating. */
  async issue(userId: string, role: AuthRole, familyId: string = generateUuid()): Promise<string> {
    const token = randomBytes(48).toString('base64url');
    await this.tokens.create({
      tokenHash: hashToken(token),
      userId,
      role,
      familyId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    return token;
  }

  async rotate(token: string, role: AuthRole): Promise<RotatedToken> {
    const tokenHash = hashToken(token);
    const claimed = (await this.tokens.claim(tokenHash, role)) ?? (await this.resolveUsedToken(tokenHash, role));

    return { token: await this.issue(claimed.userId, role, claimed.familyId), userId: claimed.userId };
  }

  async revoke(token: string): Promise<void> {
    const stored = await this.tokens.findByHash(hashToken(token));
    if (stored) await this.tokens.revokeFamily(stored.familyId);
  }

  /**
   * A token that can't be claimed. Used moments ago, it's a browser that never received the reply,
   * such as a reload during a refresh, so it gets a new token. Used longer ago, it was probably
   * stolen, so the whole chain ends. A chain ended by logout can never come back.
   */
  private async resolveUsedToken(tokenHash: string, role: AuthRole): Promise<RefreshToken> {
    const stored = await this.tokens.findByHash(tokenHash);

    if (!stored || stored.role !== role || stored.revokedAt || !stored.rotatedAt || stored.expiresAt <= new Date()) {
      throw new UnauthorizedException(SESSION_ENDED_MESSAGE);
    }
    if (Date.now() - stored.rotatedAt.getTime() > REFRESH_REUSE_GRACE_MS) {
      await this.tokens.revokeFamily(stored.familyId);
      throw new UnauthorizedException(SESSION_ENDED_MESSAGE);
    }
    return stored;
  }
}
