import { AUTH_ROLES, type AuthRole } from '@kadai/shared';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from '../../common/database/base.schema.js';
import { EntitySchema } from '../../common/database/entity-schema.decorator.js';

@EntitySchema('refresh_tokens')
export class RefreshToken extends BaseSchema {
  /** Only a hash is stored, so a database leak doesn't expose usable tokens. */
  @Prop({ type: String, required: true, unique: true })
  tokenHash: string;

  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true, enum: AUTH_ROLES })
  role: AuthRole;

  /** Shared by every token from one login, so a stolen chain can be ended in one step. */
  @Prop({ type: String, required: true, index: true })
  familyId: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  /** When this token was swapped for its replacement. */
  @Prop({ type: Date, default: null })
  rotatedAt: Date | null;

  /** When the login ended, by logout or suspected theft. Nothing can bring it back. */
  @Prop({ type: Date, default: null })
  revokedAt: Date | null;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// MongoDB deletes tokens once they expire.
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
