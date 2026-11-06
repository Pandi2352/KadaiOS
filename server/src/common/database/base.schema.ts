import { generateUuid } from '@kadai/shared';
import { Prop } from '@nestjs/mongoose';

/** Every collection extends this so its _id is a UUID, never an ObjectId. */
export abstract class BaseSchema {
  @Prop({ type: String, default: generateUuid })
  _id: string;

  createdAt: Date;
  updatedAt: Date;
}
