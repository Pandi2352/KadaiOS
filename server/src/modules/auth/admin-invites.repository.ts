import type { AdminInviteStatus } from '@kadai/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, QueryFilter } from 'mongoose';
import { BaseRepository } from '../../common/database/base.repository.js';
import { escapeRegExp } from '../../common/database/escape-regexp.js';
import { AdminInvite } from './admin-invite.schema.js';
import type { AdminInviteListQueryDto } from './dto/admin-invite-list-query.dto.js';

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

  findInvitePage({ search, status, ...pagination }: AdminInviteListQueryDto) {
    const now = new Date();
    const filters: Record<AdminInviteStatus, QueryFilter<AdminInvite>> = {
      pending: { acceptedAt: null, expiresAt: { $gte: now } },
      accepted: { acceptedAt: { $ne: null } },
      expired: { acceptedAt: null, expiresAt: { $lt: now } },
    };

    return this.findPage(pagination, {
      ...(status && filters[status]),
      ...(search && { email: new RegExp(escapeRegExp(search), 'i') }),
    });
  }

  async markAccepted(id: string) {
    return this.model.findByIdAndUpdate(id, { acceptedAt: new Date() }, { returnDocument: 'after' }).exec();
  }

  async deleteById(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }
}
