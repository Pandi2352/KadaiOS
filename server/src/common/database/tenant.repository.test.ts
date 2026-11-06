import { NotFoundException } from '@nestjs/common';
import type { Model } from 'mongoose';
import { describe, expect, it, vi } from 'vitest';
import { TenantRepository } from './tenant.repository.js';
import type { TenantSchema } from './tenant.schema.js';

interface Item extends TenantSchema {
  name: string;
}

class ItemsRepository extends TenantRepository<Item> {
  constructor(model: Model<Item>) {
    super(model, 'Item');
  }
}

const query = (result: unknown) => {
  const chain = { sort: () => chain, skip: () => chain, limit: () => chain, exec: async () => result };
  return chain;
};

describe('TenantRepository', () => {
  it('filters single reads by shop', async () => {
    const findOne = vi.fn(() => query(null));
    const repository = new ItemsRepository({ findOne } as unknown as Model<Item>);

    await expect(repository.findForShopOrThrow('shop-a', 'item-1')).rejects.toThrow(NotFoundException);
    expect(findOne).toHaveBeenCalledWith({ _id: 'item-1', shopId: 'shop-a' });
  });

  it('filters lists by shop, and a caller filter cannot replace it', async () => {
    const find = vi.fn(() => query([]));
    const countDocuments = vi.fn(() => query(0));
    const repository = new ItemsRepository({ find, countDocuments } as unknown as Model<Item>);

    await repository.findPageForShop('shop-a', { page: 1, limit: 20 }, { shopId: 'shop-b', name: 'x' });

    expect(find).toHaveBeenCalledWith({ shopId: 'shop-a', name: 'x' });
    expect(countDocuments).toHaveBeenCalledWith({ shopId: 'shop-a', name: 'x' });
  });
});
