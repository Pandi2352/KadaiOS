import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { isDuplicateKeyError } from '../../common/database/duplicate-key.js';
import { UsersRepository } from '../users/users.repository.js';
import { LOGIN_REQUIRED_MESSAGE } from './auth.constants.js';
import { AuthService, type IssuedSession } from './auth.service.js';
import type { ChangeEmailDto } from './dto/change-email.dto.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';
import { PasswordService } from './password.service.js';
import { RefreshTokenService } from './refresh-token.service.js';

export const WRONG_PASSWORD_MESSAGE = 'Current password is incorrect';
export const SAME_PASSWORD_MESSAGE = 'New password must be different from your current password';
export const SAME_EMAIL_MESSAGE = 'This is already your email';
export const EMAIL_IN_USE_MESSAGE = 'Another account already uses this email';

const fieldError = (field: string, message: string) => ({ message, fields: { [field]: [message] } });

/**
 * Changes that could take over an account, so each needs the current password. A wrong password
 * is a 400 and not a 401, because a 401 tells the website that the login has ended.
 */
@Injectable()
export class AccountService {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwords: PasswordService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly auth: AuthService,
  ) {}

  async changePassword(userId: string, { currentPassword, newPassword }: ChangePasswordDto): Promise<IssuedSession> {
    await this.verifyCurrentPassword(userId, currentPassword);
    if (newPassword === currentPassword) {
      throw new BadRequestException(fieldError('newPassword', SAME_PASSWORD_MESSAGE));
    }

    await this.users.updatePassword(userId, await this.passwords.hash(newPassword));
    return this.restartSessions(userId);
  }

  async changeEmail(userId: string, { email, currentPassword }: ChangeEmailDto): Promise<IssuedSession> {
    const user = await this.verifyCurrentPassword(userId, currentPassword);
    if (email === user.email) throw new BadRequestException(fieldError('email', SAME_EMAIL_MESSAGE));

    try {
      await this.users.updateEmail(userId, email);
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ConflictException(fieldError('email', EMAIL_IN_USE_MESSAGE));
      throw error;
    }
    return this.restartSessions(userId);
  }

  private async verifyCurrentPassword(userId: string, password: string) {
    const user = await this.users.findActiveByIdWithPassword(userId);
    if (!user) throw new UnauthorizedException(LOGIN_REQUIRED_MESSAGE);

    if (!(await this.passwords.verify(user.passwordHash, password))) {
      throw new BadRequestException(fieldError('currentPassword', WRONG_PASSWORD_MESSAGE));
    }
    return user;
  }

  /** Logs out every other device, in case someone else was using the account, and keeps this one logged in. */
  private async restartSessions(userId: string): Promise<IssuedSession> {
    await this.refreshTokens.revokeAllForUser(userId);

    const user = await this.users.findActiveById(userId);
    if (!user) throw new UnauthorizedException(LOGIN_REQUIRED_MESSAGE);
    return this.auth.startSession(user);
  }
}
