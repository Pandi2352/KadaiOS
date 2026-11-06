import { STAFF_ROLES, type StaffRole } from '@kadai/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateStaffRoleDto {
  @ApiProperty({ enum: STAFF_ROLES, example: 'manager' })
  @IsEnum(STAFF_ROLES)
  staffRole: StaffRole;
}
