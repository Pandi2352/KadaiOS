import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { ShopsModule } from './modules/shops/shops.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }), DatabaseModule, HealthModule, ShopsModule],
})
export class AppModule {}
