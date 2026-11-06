import type { AuthRole } from '@kadai/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '../../common/database/base.repository.js';
import { User } from './user.schema.js';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) model: Model<User>) {
    super(model, 'User');
  }

  /** Resolves once the unique indexes exist, so duplicates can't slip in during startup. */
  async ensureIndexes(): Promise<void> {
    await this.model.init();
  }

  findWithPassword(email: string, role: AuthRole) {
    return this.model.findOne({ email, role }).select('+passwordHash').exec();
  }

  exists(email: string, role: AuthRole) {
    return this.model.exists({ email, role }).exec();
  }

  findActiveById(id: string) {
    return this.model.findOne({ _id: id, isActive: true }).exec();
  }

  async recordLogin(id: string): Promise<void> {
    await this.model.updateOne({ _id: id }, { lastLoginAt: new Date() }).exec();
  }
}
