import { ADMIN_INVITE_STATUSES, type AdminInviteStatus, EMAIL_MAX_LENGTH } from '@kadai/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class AdminInviteListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Matches the invited email' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(EMAIL_MAX_LENGTH)
  search?: string;

  @ApiPropertyOptional({ enum: ADMIN_INVITE_STATUSES })
  @IsOptional()
  @IsIn(ADMIN_INVITE_STATUSES)
  status?: AdminInviteStatus;
}
