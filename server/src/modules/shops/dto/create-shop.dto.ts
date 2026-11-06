import { BUSINESS_TYPES, type BusinessType, FIELD_LIMITS } from '@kadai/shared';
import {
  EnumField,
  OptionalPhoneField,
  OptionalTextField,
  TextField,
} from '../../../common/decorators/field.decorators.js';

export class CreateShopDto {
  @TextField({ label: 'Shop name', example: 'Shop name' })
  name: string;

  @EnumField('Business type', BUSINESS_TYPES, 'meat')
  businessType: BusinessType;

  @OptionalPhoneField()
  phone?: string;

  @OptionalTextField({ label: 'Address', example: 'Shop address', max: FIELD_LIMITS.longText })
  address?: string;
}
