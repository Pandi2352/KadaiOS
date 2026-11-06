import { BUSINESS_TYPES, type BusinessType } from '@kadai/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/dto/base-response.dto.js';

export class ShopResponseDto extends BaseResponseDto {
  @ApiProperty({ example: 'Shop name' })
  name: string;

  @ApiProperty({ enum: BUSINESS_TYPES, example: 'meat' })
  businessType: BusinessType;

  @ApiPropertyOptional({ example: '+919000000000' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Shop address' })
  address?: string;
}
