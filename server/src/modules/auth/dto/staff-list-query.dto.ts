import { FIELD_LIMITS, STAFF_ROLES, STAFF_STATUSES, type StaffRole, type StaffStatus } from '@kadai/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class StaffListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Matches the name, the email or the role's name" })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.shortText)
  search?: string;

  @ApiPropertyOptional({ enum: STAFF_ROLES })
  @IsOptional()
  @IsIn(STAFF_ROLES)
  staffRole?: StaffRole;

  @ApiPropertyOptional({ enum: STAFF_STATUSES })
  @IsOptional()
  @IsIn(STAFF_STATUSES)
  status?: StaffStatus;
}
