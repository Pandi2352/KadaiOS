import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ enum: ['connected'], example: 'connected' })
  database: 'connected';
}
