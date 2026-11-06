import { AUTH_ROLES, type AuthRole, STAFF_ROLES, type StaffRole } from '@kadai/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ACCESS_TOKEN_TTL_SECONDS } from '../auth.constants.js';

export class AuthUserDto {
  @ApiProperty({ format: 'uuid', example: '01a1af2f-9961-7456-9908-ce97dce61f34' })
  id: string;

  @ApiProperty({ example: 'Your name' })
  name: string;

  @ApiProperty({ format: 'email', example: 'name@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+919000000000' })
  phone?: string;

  @ApiProperty({ enum: AUTH_ROLES, example: 'customer' })
  role: AuthRole;

  @ApiPropertyOptional({ enum: STAFF_ROLES, example: 'admin' })
  staffRole?: StaffRole;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}

export class AuthSessionDto {
  @ApiProperty({ description: 'JWT to send as `Authorization: Bearer <token>`.' })
  accessToken: string;

  @ApiProperty({ description: 'Seconds until the access token expires.', example: ACCESS_TOKEN_TTL_SECONDS })
  expiresIn: number;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  loggedOut: boolean;
}
