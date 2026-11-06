import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BUSINESS_TYPES, type BusinessType } from '../../../common/constants/business-type.js';

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn(BUSINESS_TYPES)
  businessType: BusinessType;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
