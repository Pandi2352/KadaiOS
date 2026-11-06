import { Prop } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema.js';

/** Every record that belongs to a shop extends this. Query it through TenantRepository. */
export abstract class TenantSchema extends BaseSchema {
  @Prop({ type: String, required: true, index: true })
  shopId: string;
}
