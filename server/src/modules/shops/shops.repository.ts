import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '../../common/database/base.repository.js';
import { Shop } from './shop.schema.js';

@Injectable()
export class ShopsRepository extends BaseRepository<Shop> {
  constructor(@InjectModel(Shop.name) model: Model<Shop>) {
    super(model, 'Shop');
  }
}
