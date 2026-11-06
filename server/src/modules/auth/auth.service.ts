import type { AuthRole, AuthSession } from '@kadai/shared';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { isDuplicateKeyError } from '../../common/database/duplicate-key.js';
import { toAuthUser } from '../users/to-auth-user.js';
import type { User } from '../users/user.schema.js';
import { UsersRepository } from '../users/users.repository.js';
import { AccessTokenService } from './access-token.service.js';
import { ACCESS_TOKEN_TTL_SECONDS } from './auth.constants.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import { PasswordService } from './password.service.js';
import { RefreshTokenService, SESSION_ENDED_MESSAGE } from './refresh-token.service.js';

export const INVALID_LOGIN_MESSAGE = 'Email or password is incorrect';
export const EMAIL_TAKEN_MESSAGE = 'An account with this email already exists. Log in instead.';

export interface IssuedSession {
  session: AuthSession;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwords: PasswordService,
    private readonly accessTokens: AccessTokenService,
    private readonly refreshTokens: RefreshTokenService,
  ) {}

  /** Customers only. Admins join by invitation, so no route creates an admin. */
  async registerCustomer({ password, ...details }: RegisterDto): Promise<IssuedSession> {
    const passwordHash = await this.passwords.hash(password);

    try {
      const user = await this.users.create({ ...details, passwordHash, role: 'customer' });
      return await this.startSession(user);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException({ message: EMAIL_TAKEN_MESSAGE, fields: { email: [EMAIL_TAKEN_MESSAGE] } });
      }
      throw error;
    }
  }

  async login(role: AuthRole, { email, password }: LoginDto): Promise<IssuedSession> {
    const user = await this.users.findWithPassword(email, role);
    const isValid = await this.passwords.verify(user?.passwordHash, password);

    // One message for every failure, so the response never reveals which emails have accounts.
    if (!user || !isValid || !user.isActive) {
      throw new UnauthorizedException(INVALID_LOGIN_MESSAGE);
    }

    await this.users.recordLogin(user._id);
    return this.startSession(user);
  }

  async refresh(role: AuthRole, token: string): Promise<IssuedSession> {
    const rotated = await this.refreshTokens.rotate(token, role);
    const user = await this.users.findActiveById(rotated.userId);

    if (!user) {
      await this.refreshTokens.revoke(rotated.token);
      throw new UnauthorizedException(SESSION_ENDED_MESSAGE);
    }
    return { session: await this.buildSession(user), refreshToken: rotated.token };
  }

  logout(token: string): Promise<void> {
    return this.refreshTokens.revoke(token);
  }

  private async startSession(user: User): Promise<IssuedSession> {
    const refreshToken = await this.refreshTokens.issue(user._id, user.role);
    return { session: await this.buildSession(user), refreshToken };
  }

  private async buildSession(user: User): Promise<AuthSession> {
    const accessToken = await this.accessTokens.sign({ sub: user._id, role: user.role });
    return { accessToken, expiresIn: ACCESS_TOKEN_TTL_SECONDS, user: toAuthUser(user) };
  }
}
