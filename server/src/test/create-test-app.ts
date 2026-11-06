import 'reflect-metadata';
import type { INestApplication, ModuleMetadata } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { API_PREFIX, API_VERSION } from '@kadai/shared';
import type { Connection } from 'mongoose';
import { configureApp } from '../common/bootstrap/configure-app.js';

export interface TestApp {
  app: INestApplication;
  url: (path: string) => string;
  close: () => Promise<void>;
}

/** Waits for background index builds first, because a late one would recreate the dropped database. */
export async function dropTestDatabase(connection: Connection): Promise<void> {
  await Promise.all(Object.values(connection.models).map((model) => model.init()));
  await connection.dropDatabase();
}

/** Boots the given controllers with the real pipes, filters and versioning on a random port. */
export async function createTestApp(metadata: ModuleMetadata, swaggerEnabled = false): Promise<TestApp> {
  @Module(metadata)
  class TestModule {}

  const app = await NestFactory.create(TestModule, { logger: false });
  configureApp(app, ['*'], swaggerEnabled);
  await app.listen(0);
  const base = await app.getUrl();

  return {
    app,
    url: (path) => `${base.replace('[::1]', 'localhost')}/${API_PREFIX}/v${API_VERSION}${path}`,
    close: () => app.close(),
  };
}
