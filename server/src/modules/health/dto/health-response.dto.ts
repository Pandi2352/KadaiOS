import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ enum: ['connected', 'disconnected'], example: 'connected' })
  database: 'connected' | 'disconnected';
}
