import { NotFoundException } from '@nestjs/common';
import type { Paginated } from '@kadai/shared';
import type { ClientSession, HydratedDocument, Model, QueryFilter } from 'mongoose';
import type { PaginationQueryDto } from '../dto/pagination-query.dto.js';
import type { BaseSchema } from './base.schema.js';

export abstract class BaseRepository<T extends BaseSchema> {
  protected constructor(
    protected readonly model: Model<T>,
    protected readonly entityName: string,
  ) {}

  /** Pass the session from TransactionService.run to include this write in a transaction. */
  async create(data: Partial<T>, session?: ClientSession): Promise<HydratedDocument<T>> {
    const document = new this.model(data);
    await document.save({ session });
    return document;
  }

  async findByIdOrThrow(id: string): Promise<HydratedDocument<T>> {
    return this.findOneOrThrow({ _id: id } as QueryFilter<T>);
  }

  /** Newest first: UUID v7 IDs sort by creation time. */
  async findPage(
    { page, limit }: PaginationQueryDto,
    filter: QueryFilter<T> = {},
  ): Promise<Paginated<HydratedDocument<T>>> {
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  protected async findOneOrThrow(filter: QueryFilter<T>): Promise<HydratedDocument<T>> {
    const document = await this.model.findOne(filter).exec();
    if (!document) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    return document;
  }
}
