import { type AuthRole, STAFF_ROLE_DEFINITIONS, STAFF_ROLES, type StaffRole } from '@kadai/shared';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, QueryFilter } from 'mongoose';
import { BaseRepository } from '../../common/database/base.repository.js';
import { escapeRegExp } from '../../common/database/escape-regexp.js';
import type { StaffListQueryDto } from '../auth/dto/staff-list-query.dto.js';
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

  hasAnyWithRole(role: AuthRole) {
    return this.model.exists({ role }).exec();
  }

  findById(id: string) {
    return this.model.findById(id).exec();
  }

  findStaffPage({ search, staffRole, status, ...pagination }: StaffListQueryDto) {
    const filter: QueryFilter<User> = {
      role: 'admin',
      ...(staffRole && { staffRole }),
      ...(status && { isActive: status === 'active' ? { $ne: false } : false }),
    };

    if (search) {
      const pattern = new RegExp(escapeRegExp(search), 'i');
      const text = search.toLowerCase();
      const roles = STAFF_ROLES.filter((role) => STAFF_ROLE_DEFINITIONS[role].name.toLowerCase().includes(text));
      filter.$or = [{ name: pattern }, { email: pattern }, { staffRole: { $in: roles } }];
    }

    return this.findPage(pagination, filter);
  }

  countActiveSuperAdmins() {
    return this.model.countDocuments({ role: 'admin', staffRole: 'super_admin', isActive: { $ne: false } }).exec();
  }

  /** Admins from before staff roles existed had full access, so they keep it. */
  async promoteAdminsWithoutRole(): Promise<number> {
    const { modifiedCount } = await this.model
      .updateMany({ role: 'admin', staffRole: { $exists: false } }, { $set: { staffRole: 'super_admin' } })
      .exec();
    return modifiedCount;
  }

  findActiveById(id: string) {
    return this.model.findOne({ _id: id, isActive: true }).exec();
  }

  findActiveByIdWithPassword(id: string) {
    return this.model.findOne({ _id: id, isActive: true }).select('+passwordHash').exec();
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.model.updateOne({ _id: id }, { passwordHash }).exec();
  }

  /** Fails with a duplicate key error if another account of the same role has this email. */
  updateEmail(id: string, email: string) {
    return this.model.findOneAndUpdate({ _id: id }, { email }, { returnDocument: 'after', runValidators: true }).exec();
  }

  /** Replaces the editable details. With no phone, any saved phone is removed. */
  updateProfile(id: string, { name, phone }: { name: string; phone?: string }) {
    return this.model
      .findOneAndUpdate(
        { _id: id, isActive: true },
        phone ? { $set: { name, phone } } : { $set: { name }, $unset: { phone: 1 } },
        { returnDocument: 'after', runValidators: true },
      )
      .exec();
  }

  updateStaffRole(id: string, staffRole: StaffRole) {
    return this.model
      .findOneAndUpdate({ _id: id }, { $set: { staffRole } }, { returnDocument: 'after', runValidators: true })
      .exec();
  }

  updateStatus(id: string, isActive: boolean) {
    return this.model
      .findOneAndUpdate({ _id: id }, { $set: { isActive } }, { returnDocument: 'after', runValidators: true })
      .exec();
  }

  deleteById(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }

  async recordLogin(id: string): Promise<void> {
    await this.model.updateOne({ _id: id }, { lastLoginAt: new Date() }).exec();
  }
}
