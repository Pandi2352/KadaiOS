import type { CreateShopInput, Paginated, PaginationQuery, Shop } from '@kadai/shared';
import { api } from '@/lib/api/client';

export const shopsApi = {
  list: (query: PaginationQuery, signal?: AbortSignal) => api.get<Paginated<Shop>>('/shops', { query, signal }),
  create: (input: CreateShopInput) => api.post<Shop>('/shops', input),
};
