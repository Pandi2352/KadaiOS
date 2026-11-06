import type { AuthRole } from '@kadai/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseRepository } from '../../common/database/base.repository.js';
import { RefreshToken } from './refresh-token.schema.js';

@Injectable()
export class RefreshTokensRepository extends BaseRepository<RefreshToken> {
  constructor(@InjectModel(RefreshToken.name) model: Model<RefreshToken>) {
    super(model, 'Refresh token');
  }

  /** One atomic step, so exactly one request can be the first to use a token. */
  claim(tokenHash: string, role: AuthRole) {
    return this.model
      .findOneAndUpdate(
        { tokenHash, role, rotatedAt: null, revokedAt: null, expiresAt: { $gt: new Date() } },
        { rotatedAt: new Date() },
      )
      .exec();
  }

  findByHash(tokenHash: string) {
    return this.model.findOne({ tokenHash }).exec();
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.model.updateMany({ familyId, revokedAt: null }, { revokedAt: new Date() }).exec();
  }
}
