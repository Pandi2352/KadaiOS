import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UuidParam } from '../../common/decorators/uuid-param.decorator.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { CreateShopDto } from './dto/create-shop.dto.js';
import { ShopsRepository } from './shops.repository.js';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shops: ShopsRepository) {}

  @Post()
  create(@Body() dto: CreateShopDto) {
    return this.shops.create(dto);
  }

  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.shops.findPage(query);
  }

  @Get(':id')
  get(@UuidParam() id: string) {
    return this.shops.findByIdOrThrow(id);
  }
}
