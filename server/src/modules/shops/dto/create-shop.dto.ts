import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BUSINESS_TYPES, type BusinessType } from '../../../common/constants/business-type.js';

export class CreateShopDto {
  @ApiProperty({ example: 'Shop name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: BUSINESS_TYPES, example: 'meat' })
  @IsIn(BUSINESS_TYPES)
  businessType: BusinessType;

  @ApiPropertyOptional({ example: 'Shop phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Shop address' })
  @IsOptional()
  @IsString()
  address?: string;
}
