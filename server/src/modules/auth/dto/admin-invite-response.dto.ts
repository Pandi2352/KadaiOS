import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ADMIN_INVITE_STATUSES, type AdminInvite, type AdminInviteStatus } from '@kadai/shared';

export class AdminInviteResponseDto implements AdminInvite {
  @ApiProperty({ example: '019318b8-6e54-7000-8000-111111111111' })
  id: string;

  @ApiProperty({ example: 'staff@example.com' })
  email: string;

  @ApiProperty({ example: '019318b8-6e54-7000-8000-000000000000' })
  invitedBy: string;

  @ApiPropertyOptional({ example: 'Default Admin' })
  invitedByName?: string;

  @ApiProperty({ enum: ADMIN_INVITE_STATUSES, example: 'pending' })
  status: AdminInviteStatus;

  @ApiProperty({ example: '2026-11-08T10:00:00.000Z' })
  expiresAt: string;

  @ApiPropertyOptional({ example: '2026-11-06T12:00:00.000Z' })
  acceptedAt?: string;

  @ApiProperty({ example: '2026-11-06T10:00:00.000Z' })
  createdAt: string;
}

export class ValidateAdminInviteResponseDto {
  @ApiProperty({ example: 'staff@example.com' })
  email: string;

  @ApiProperty({ example: true })
  valid: boolean;
}

export class RevokeAdminInviteResponseDto {
  @ApiProperty({ example: true })
  revoked: boolean;
}

