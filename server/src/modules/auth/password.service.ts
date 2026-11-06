import { Injectable } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';

/** Argon2id with the cost OWASP recommends as a minimum: 19 MiB of memory, 2 passes. */
const HASH_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

@Injectable()
export class PasswordService {
  private dummyHash?: Promise<string>;

  hash(password: string): Promise<string> {
    return hash(password, HASH_OPTIONS);
  }

  /**
   * Always does the full work. With no stored hash it checks against a dummy, so a login
   * for an unknown email takes as long as a wrong password and can't reveal who has an account.
   */
  async verify(storedHash: string | undefined, password: string): Promise<boolean> {
    this.dummyHash ??= this.hash('no-account-has-this-password');
    const matches = await verify(storedHash ?? (await this.dummyHash), password);
    return storedHash !== undefined && matches;
  }
}
