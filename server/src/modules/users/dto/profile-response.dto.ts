import { ApiProperty } from '@nestjs/swagger';
import { AuthUserDto } from '../../auth/dto/auth-response.dto.js';

export class ProfileResponseDto extends AuthUserDto {
  @ApiProperty({ type: String, format: 'date-time', description: 'When the account was created.' })
  createdAt: string;
}
