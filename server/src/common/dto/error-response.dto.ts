import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ErrorDetailDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    description: 'One message, or a list when several fields fail validation.',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiPropertyOptional({
    description: 'Validation messages by field name. Only sent when a request fails validation.',
    type: 'object',
    additionalProperties: { type: 'array', items: { type: 'string' } },
    example: { name: ['Shop name is required'] },
  })
  fields?: Record<string, string[]>;
}

/** The body AllExceptionsFilter sends for every error. */
export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ type: ErrorDetailDto })
  error: ErrorDetailDto;
}
