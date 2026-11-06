import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersRepository } from '../../users/users.repository.js';
import { toAuthUser } from '../../users/to-auth-user.js';
import { AccessTokenService } from '../access-token.service.js';
import { LOGIN_REQUIRED_MESSAGE } from '../auth.constants.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import type { AuthenticatedRequest } from './authenticated-request.js';

const readBearerToken = (header: string | undefined): string | undefined => {
  const [scheme, token, extra] = header?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && token && !extra ? token : undefined;
};

/** Runs on every route, so a new route needs a login unless it's marked @Public(). */
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokens: AccessTokenService,
    private readonly users: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = readBearerToken(request.headers.authorization);
    if (!token) throw new UnauthorizedException(LOGIN_REQUIRED_MESSAGE);

    const claims = await this.accessTokens.verify(token);

    // Checked on every request, so a deactivated user loses access straight away, not when the token expires.
    const user = await this.users.findActiveById(claims.sub);
    if (!user || user.role !== claims.role) throw new UnauthorizedException(LOGIN_REQUIRED_MESSAGE);

    request.user = toAuthUser(user);
    return true;
  }
}
