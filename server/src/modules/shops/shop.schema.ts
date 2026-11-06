import { BUSINESS_TYPES, type BusinessType, FIELD_LIMITS } from '@kadai/shared';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from '../../common/database/base.schema.js';
import { EntitySchema } from '../../common/database/entity-schema.decorator.js';

@EntitySchema('shops')
export class Shop extends BaseSchema {
  @Prop({ type: String, required: true, trim: true, maxlength: FIELD_LIMITS.shortText })
  name: string;

  @Prop({ type: String, required: true, enum: BUSINESS_TYPES })
  businessType: BusinessType;

  @Prop({ type: String, trim: true })
  phone?: string;

  @Prop({ type: String, trim: true, maxlength: FIELD_LIMITS.longText })
  address?: string;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
