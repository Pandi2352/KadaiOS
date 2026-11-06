import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Shop, ShopSchema } from './shop.schema.js';
import { ShopsController } from './shops.controller.js';
import { ShopsRepository } from './shops.repository.js';
import { ShopsService } from './shops.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Shop.name, schema: ShopSchema }])],
  controllers: [ShopsController],
  providers: [ShopsRepository, ShopsService],
})
export class ShopsModule {}
