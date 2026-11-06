import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BUSINESS_TYPES, type BusinessType } from '../../../common/constants/business-type.js';
import { BaseResponseDto } from '../../../common/dto/base-response.dto.js';

export class ShopResponseDto extends BaseResponseDto {
  @ApiProperty({ example: 'Shop name' })
  name: string;

  @ApiProperty({ enum: BUSINESS_TYPES, example: 'meat' })
  businessType: BusinessType;

  @ApiPropertyOptional({ example: 'Shop phone number' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Shop address' })
  address?: string;
}
