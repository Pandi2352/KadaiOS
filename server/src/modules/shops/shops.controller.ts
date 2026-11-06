import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UuidParam } from '../../common/decorators/uuid-param.decorator.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ApiEndpoint } from '../../common/swagger/api-endpoint.decorator.js';
import { RequirePermission } from '../auth/decorators/require-permission.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateShopDto } from './dto/create-shop.dto.js';
import { ShopResponseDto } from './dto/shop-response.dto.js';
import { ShopsService } from './shops.service.js';

@Roles('admin')
@ApiTags('Shops')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shops: ShopsService) {}

  @Post()
  @RequirePermission('shops:create')
  @ApiEndpoint({ summary: 'Create a shop', response: ShopResponseDto, status: HttpStatus.CREATED, validates: true })
  create(@Body() dto: CreateShopDto) {
    return this.shops.create(dto);
  }

  @Get()
  @RequirePermission('shops:view')
  @ApiEndpoint({ summary: 'List shops, newest first', response: ShopResponseDto, paginated: true, validates: true })
  list(@Query() query: PaginationQueryDto) {
    return this.shops.list(query);
  }

  @Get(':id')
  @RequirePermission('shops:view')
  @ApiEndpoint({ summary: 'Get one shop', response: ShopResponseDto, uuidParam: 'id', notFound: 'Shop' })
  get(@UuidParam() id: string) {
    return this.shops.get(id);
  }
}
