import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { ClientSession, Connection } from 'mongoose';

const ILLEGAL_OPERATION = 20;

const isStandaloneError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === ILLEGAL_OPERATION;

/** Runs several writes as one: if any fails, none are saved. Needs MongoDB as a replica set. */
@Injectable()
export class TransactionService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async run<T>(work: (session: ClientSession) => Promise<T>): Promise<T> {
    try {
      return await this.connection.transaction(work);
    } catch (error) {
      if (isStandaloneError(error)) {
        throw new ServiceUnavailableException(
          'Transactions need MongoDB running as a replica set. See "MongoDB replica set" in the README.',
        );
      }
      throw error;
    }
  }
}
