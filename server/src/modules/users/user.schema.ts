import { AUTH_ROLES, type AuthRole, EMAIL_MAX_LENGTH, FIELD_LIMITS } from '@kadai/shared';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from '../../common/database/base.schema.js';
import { EntitySchema } from '../../common/database/entity-schema.decorator.js';

@EntitySchema('users')
export class User extends BaseSchema {
  @Prop({ type: String, required: true, trim: true, maxlength: FIELD_LIMITS.shortText })
  name: string;

  @Prop({ type: String, required: true, trim: true, lowercase: true, maxlength: EMAIL_MAX_LENGTH })
  email: string;

  @Prop({ type: String, trim: true })
  phone?: string;

  /** Never loaded unless a query asks for it, so it can't leak into a response by accident. */
  @Prop({ type: String, required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, required: true, enum: AUTH_ROLES })
  role: AuthRole;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Per role, so a customer account never reveals or blocks an admin with the same email.
UserSchema.index({ email: 1, role: 1 }, { unique: true });
