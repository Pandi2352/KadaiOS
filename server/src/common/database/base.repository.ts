import { NotFoundException } from '@nestjs/common';
import type { HydratedDocument, Model, QueryFilter } from 'mongoose';
import type { PaginationQueryDto } from '../dto/pagination-query.dto.js';
import type { PaginatedResult } from '../types/paginated-result.js';
import type { BaseSchema } from './base.schema.js';

export abstract class BaseRepository<T extends BaseSchema> {
  protected constructor(
    protected readonly model: Model<T>,
    private readonly entityName: string,
  ) {}

  async create(data: Partial<T>): Promise<HydratedDocument<T>> {
    const document = new this.model(data);
    await document.save();
    return document;
  }

  async findByIdOrThrow(id: string): Promise<HydratedDocument<T>> {
    const document = await this.model.findById(id).exec();
    if (!document) {
      throw new NotFoundException(`${this.entityName} not found`);
    }
    return document;
  }

  /** Newest first: UUID v7 IDs sort by creation time. */
  async findPage(
    { page, limit }: PaginationQueryDto,
    filter: QueryFilter<T> = {},
  ): Promise<PaginatedResult<HydratedDocument<T>>> {
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
}
