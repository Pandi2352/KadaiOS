import { Schema } from '@nestjs/mongoose';

/** Shared schema options: timestamps on, and API responses expose id instead of _id. */
export const EntitySchema = (collection: string): ClassDecorator =>
  Schema({
    collection,
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        const { _id, ...rest } = ret;
        return { id: _id, ...rest };
      },
    },
  });
