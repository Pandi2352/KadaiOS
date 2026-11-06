import { STAFF_ROLES, type StaffRole } from '@kadai/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EmailField } from '../../../common/decorators/field.decorators.js';

export class CreateAdminInviteDto {
  @EmailField()
  email: string;

  @ApiPropertyOptional({ enum: STAFF_ROLES, example: 'admin' })
  @IsOptional()
  @IsEnum(STAFF_ROLES)
  staffRole?: StaffRole;
}
