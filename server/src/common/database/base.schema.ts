import { Prop } from '@nestjs/mongoose';
import { generateUuid } from '../utils/uuid.util.js';

/** Every collection extends this so its _id is a UUID, never an ObjectId. */
export abstract class BaseSchema {
  @Prop({ type: String, default: generateUuid })
  _id: string;

  createdAt: Date;
  updatedAt: Date;
}
