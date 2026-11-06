import { EMAIL_MAX_LENGTH } from '@kadai/shared';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from '../../common/database/base.schema.js';
import { EntitySchema } from '../../common/database/entity-schema.decorator.js';

@EntitySchema('admin_invites')
export class AdminInvite extends BaseSchema {
  @Prop({ type: String, required: true, trim: true, lowercase: true, maxlength: EMAIL_MAX_LENGTH, index: true })
  email: string;

  /** Stored as a SHA-256 hash so a leaked database cannot be used to claim pending invites. */
  @Prop({ type: String, required: true, unique: true })
  tokenHash: string;

  @Prop({ type: String, required: true, index: true })
  invitedBy: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date, default: null })
  acceptedAt: Date | null;
}

export const AdminInviteSchema = SchemaFactory.createForClass(AdminInvite);

// Index to quickly look up pending invites for an email
AdminInviteSchema.index({ email: 1, acceptedAt: 1, expiresAt: 1 });

