import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateStaffStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}
