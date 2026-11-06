import type { AuthUser, UserProfile } from '@kadai/shared';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from '../../common/swagger/api-endpoint.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ProfileResponseDto } from './dto/profile-response.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ProfileService } from './profile.service.js';

@Roles()
@ApiTags('Profile')
@Controller('users/me')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  @ApiEndpoint({ summary: 'Get your own profile', response: ProfileResponseDto })
  get(@CurrentUser() user: AuthUser): Promise<UserProfile> {
    return this.profile.get(user.id);
  }

  @Put()
  @ApiEndpoint({
    summary: 'Update your own name and phone',
    description:
      'Replaces both. Leave out the phone, or send it empty, to remove it. Email and role cannot be changed here.',
    response: ProfileResponseDto,
    validates: true,
  })
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto): Promise<UserProfile> {
    return this.profile.update(user.id, dto);
  }
}
