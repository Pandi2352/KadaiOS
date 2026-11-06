import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionService } from '../common/database/transaction.service.js';
import type { AppConfig } from '../config/app.config.js';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        uri: config.getOrThrow('mongodbUri', { infer: true }),
        serverSelectionTimeoutMS: 5000,
        retryAttempts: 1,
        retryDelay: 1000,
      }),
    }),
  ],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class DatabaseModule {}
