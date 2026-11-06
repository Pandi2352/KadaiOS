import { ApiProperty } from '@nestjs/swagger';

/** Fields every record has in API responses. Response DTOs extend this. */
export abstract class BaseResponseDto {
  @ApiProperty({ format: 'uuid', example: '01a1af2f-9961-7456-9908-ce97dce61f34' })
  id: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
