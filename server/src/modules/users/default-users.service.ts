import type { AuthRole } from '@kadai/shared';
import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isDuplicateKeyError } from '../../common/database/duplicate-key.js';
import type { AppConfig } from '../../config/app.config.js';
import { PasswordService } from '../auth/password.service.js';
import { UsersRepository } from './users.repository.js';

/**
 * Admins can't register, so the first admin has to come from configuration. It only creates
 * missing users and never changes an existing one, so a restart can't undo a password change.
 */
@Injectable()
export class DefaultUsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DefaultUsersService.name);

  constructor(
    private readonly users: UsersRepository,
    private readonly passwords: PasswordService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.users.ensureIndexes();

    const promoted = await this.users.promoteAdminsWithoutRole();
    if (promoted > 0) this.logger.log(`Gave ${promoted} admin(s) with no staff role the Super Admin role`);

    // Only when there are no admins. Otherwise changing the admin's email would bring back
    // an account with the default password on the next restart.
    if (!(await this.users.hasAnyWithRole('admin'))) {
      await this.ensureUser('admin', this.config.get('defaultAdmin', { infer: true }));
    }
    await this.ensureUser('customer', this.config.get('defaultCustomer', { infer: true }));
  }

  private async ensureUser(role: AuthRole, user: AppConfig['defaultAdmin']): Promise<void> {
    if (!user) return;

    const email = user.email.toLowerCase();
    if (await this.users.exists(email, role)) return;

    try {
      const passwordHash = await this.passwords.hash(user.password);
      await this.users.create({
        name: user.name,
        email,
        passwordHash,
        role,
        ...(role === 'admin' ? { staffRole: 'super_admin' } : {}),
      });
      this.logger.log(`Created default ${role}: ${email}`);
    } catch (error) {
      // Another API process created it at the same moment, which is the outcome we wanted.
      if (!isDuplicateKeyError(error)) throw error;
    }
  }
}
