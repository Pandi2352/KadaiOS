import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import type { AppConfig } from '../../config/app.config.js';
import { UsersModule } from '../users/users.module.js';
import { AccessTokenService } from './access-token.service.js';
import { AdminAuthController } from './admin-auth.controller.js';
import { AuthCookieService } from './auth-cookie.service.js';
import { AuthService } from './auth.service.js';
import { CustomerAuthController } from './customer-auth.controller.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { RefreshToken, RefreshTokenSchema } from './refresh-token.schema.js';
import { RefreshTokenService } from './refresh-token.service.js';
import { RefreshTokensRepository } from './refresh-tokens.repository.js';

const ONE_MINUTE_MS = 60 * 1000;

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: RefreshToken.name, schema: RefreshTokenSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        secret: config.getOrThrow('jwtAccessSecret', { infer: true }),
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        throttlers: [{ ttl: ONE_MINUTE_MS, limit: config.getOrThrow('authRateLimit', { infer: true }) }],
        errorMessage: 'Too many attempts. Try again in a minute.',
      }),
    }),
  ],
  controllers: [AdminAuthController, CustomerAuthController],
  providers: [
    AuthService,
    AccessTokenService,
    RefreshTokenService,
    RefreshTokensRepository,
    AuthCookieService,
    // Global, and in this order: first work out who is calling, then check what they may do.
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AccessTokenService],
})
export class AuthModule {}
