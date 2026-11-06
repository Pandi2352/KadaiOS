import { ServiceUnavailableException } from '@nestjs/common';
import mongoose, { type Connection } from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TransactionService } from './transaction.service.js';

describe('TransactionService without a replica set', () => {
  it('explains what is needed', async () => {
    const standalone = Object.assign(new Error('Transaction numbers are only allowed on a replica set'), { code: 20 });
    const connection = { transaction: async () => Promise.reject(standalone) } as unknown as Connection;

    await expect(new TransactionService(connection).run(async () => 1)).rejects.toThrow(ServiceUnavailableException);
  });

  it('passes other errors through', async () => {
    const connection = { transaction: async () => Promise.reject(new Error('other')) } as unknown as Connection;

    await expect(new TransactionService(connection).run(async () => 1)).rejects.toThrow('other');
  });
});

// Needs a replica set: TEST_REPLICA_URI=mongodb://localhost:27099/kadai_tx_test npm test -w kadai-server
const replicaUri = process.env.TEST_REPLICA_URI;

describe.runIf(replicaUri)('TransactionService on a replica set', () => {
  let connection: Connection;
  let service: TransactionService;
  const items = () => connection.collection('tx_items');

  beforeAll(async () => {
    connection = await mongoose.createConnection(replicaUri as string).asPromise();
    service = new TransactionService(connection);
    await connection.createCollection('tx_items').catch(() => undefined);
    await items().deleteMany({});
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('saves every write when the work succeeds', async () => {
    await service.run(async (session) => {
      await items().insertOne({ name: 'bill' }, { session });
      await items().insertOne({ name: 'stock' }, { session });
    });

    expect(await items().countDocuments({})).toBe(2);
  });

  it('saves nothing when the work fails', async () => {
    await items().deleteMany({});

    await expect(
      service.run(async (session) => {
        await items().insertOne({ name: 'bill' }, { session });
        throw new Error('stock deduction failed');
      }),
    ).rejects.toThrow('stock deduction failed');

    expect(await items().countDocuments({})).toBe(0);
  });
});
