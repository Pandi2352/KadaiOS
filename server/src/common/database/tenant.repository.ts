import type { Paginated } from '@kadai/shared';
import type { ClientSession, HydratedDocument, QueryFilter } from 'mongoose';
import type { PaginationQueryDto } from '../dto/pagination-query.dto.js';
import { BaseRepository } from './base.repository.js';
import type { TenantSchema } from './tenant.schema.js';

/** Every read and write takes a shopId, so one shop can't reach another shop's records. */
export abstract class TenantRepository<T extends TenantSchema> extends BaseRepository<T> {
  async createForShop(
    shopId: string,
    data: Omit<Partial<T>, 'shopId'>,
    session?: ClientSession,
  ): Promise<HydratedDocument<T>> {
    return this.create({ ...data, shopId } as Partial<T>, session);
  }

  async findForShopOrThrow(shopId: string, id: string): Promise<HydratedDocument<T>> {
    return this.findOneOrThrow({ _id: id, shopId } as QueryFilter<T>);
  }

  async findPageForShop(
    shopId: string,
    query: PaginationQueryDto,
    filter: QueryFilter<T> = {},
  ): Promise<Paginated<HydratedDocument<T>>> {
    return this.findPage(query, { ...filter, shopId } as QueryFilter<T>);
  }
}
