import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '../../common/database/base.repository.js';
import { AdminInvite } from './admin-invite.schema.js';

@Injectable()
export class AdminInvitesRepository extends BaseRepository<AdminInvite> {
  constructor(@InjectModel(AdminInvite.name) model: Model<AdminInvite>) {
    super(model, 'Admin invite');
  }

  findByTokenHash(tokenHash: string) {
    return this.model.findOne({ tokenHash }).exec();
  }

  findPendingByEmail(email: string) {
    return this.model
      .findOne({
        email: email.toLowerCase(),
        acceptedAt: null,
        expiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async listAll(limit = 50) {
    return this.model.find().sort({ _id: -1 }).limit(limit).exec();
  }

  async markAccepted(id: string) {
    return this.model.findByIdAndUpdate(id, { acceptedAt: new Date() }, { returnDocument: 'after' }).exec();
  }

  async deleteById(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }
}
