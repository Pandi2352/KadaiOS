import type { UserProfile } from '@kadai/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LOGIN_REQUIRED_MESSAGE } from '../auth/auth.constants.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import { toUserProfile } from './to-auth-user.js';
import { UsersRepository } from './users.repository.js';

/** Takes the ID from the logged-in user, never from the request, so people can only reach their own profile. */
@Injectable()
export class ProfileService {
  constructor(private readonly users: UsersRepository) {}

  async get(userId: string): Promise<UserProfile> {
    const user = await this.users.findActiveById(userId);
    if (!user) throw new UnauthorizedException(LOGIN_REQUIRED_MESSAGE);
    return toUserProfile(user);
  }

  async update(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
    const user = await this.users.updateProfile(userId, dto);
    if (!user) throw new UnauthorizedException(LOGIN_REQUIRED_MESSAGE);
    return toUserProfile(user);
  }
}
