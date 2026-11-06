import { Injectable } from '@nestjs/common';
import type { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import type { CreateShopDto } from './dto/create-shop.dto.js';
import { ShopsRepository } from './shops.repository.js';

@Injectable()
export class ShopsService {
  constructor(private readonly shops: ShopsRepository) {}

  create(dto: CreateShopDto) {
    return this.shops.create(dto);
  }

  list(query: PaginationQueryDto) {
    return this.shops.findPage(query);
  }

  get(id: string) {
    return this.shops.findByIdOrThrow(id);
  }
}
