import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Shop, ShopSchema } from './shop.schema.js';
import { ShopsController } from './shops.controller.js';
import { ShopsRepository } from './shops.repository.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Shop.name, schema: ShopSchema }])],
  controllers: [ShopsController],
  providers: [ShopsRepository],
})
export class ShopsModule {}
