import { Logger } from '@nestjs/common';
import { PASSWORD_LIMITS } from '@kadai/shared';
import { plainToInstance, Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

const JWT_SECRET_MIN_LENGTH = 32;

/** The published development password. Production must never use it. */
export const EXAMPLE_ADMIN_PASSWORD = 'Admin@12345';

export class EnvironmentVariables {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'PORT must be a whole number' })
  @Min(1, { message: 'PORT must be between 1 and 65535' })
  @Max(65535, { message: 'PORT must be between 1 and 65535' })
  PORT?: number;

  @IsOptional()
  @Matches(/^mongodb(\+srv)?:\/\/\S+$/, { message: 'MONGODB_URI must start with mongodb:// or mongodb+srv://' })
  MONGODB_URI?: string;

  @IsOptional()
  @IsString()
  CLIENT_ORIGINS?: string;

  @IsOptional()
  @IsIn(['development', 'production', 'test'], { message: 'NODE_ENV must be development, production or test' })
  NODE_ENV?: string;

  @IsString({ message: 'JWT_ACCESS_SECRET is required' })
  @MinLength(JWT_SECRET_MIN_LENGTH, {
    message: `JWT_ACCESS_SECRET must have at least ${JWT_SECRET_MIN_LENGTH} characters. Create one with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`,
  })
  JWT_ACCESS_SECRET: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'AUTH_RATE_LIMIT must be a whole number' })
  @Min(1, { message: 'AUTH_RATE_LIMIT must be at least 1' })
  AUTH_RATE_LIMIT?: number;

  @IsOptional()
  @IsEmail({}, { message: 'DEFAULT_ADMIN_EMAIL must be a valid email address' })
  DEFAULT_ADMIN_EMAIL?: string;

  @IsOptional()
  @MinLength(PASSWORD_LIMITS.min, {
    message: `DEFAULT_ADMIN_PASSWORD must have at least ${PASSWORD_LIMITS.min} characters`,
  })
  DEFAULT_ADMIN_PASSWORD?: string;

  @IsOptional()
  @IsEmail({}, { message: 'DEFAULT_CUSTOMER_EMAIL must be a valid email address' })
  DEFAULT_CUSTOMER_EMAIL?: string;

  @IsOptional()
  @MinLength(PASSWORD_LIMITS.min, {
    message: `DEFAULT_CUSTOMER_PASSWORD must have at least ${PASSWORD_LIMITS.min} characters`,
  })
  DEFAULT_CUSTOMER_PASSWORD?: string;
}

export function findEnvErrors(env: Record<string, unknown>): string[] {
  const values = plainToInstance(EnvironmentVariables, env);
  const messages = validateSync(values).flatMap((error) => Object.values(error.constraints ?? {}));

  if (env.NODE_ENV === 'production' && env.DEFAULT_ADMIN_PASSWORD === EXAMPLE_ADMIN_PASSWORD) {
    messages.push('DEFAULT_ADMIN_PASSWORD must not be the example password in production');
  }
  return [...new Set(messages)];
}

/** Runs while modules load, before Nest can handle errors, so it exits directly with a readable message. */
export function validateEnv(env: Record<string, unknown>): Record<string, unknown> {
  const errors = findEnvErrors(env);
  if (errors.length > 0) {
    const logger = new Logger('Environment');
    logger.error('Fix these values in server/.env, then start the API again:');
    errors.forEach((message) => logger.error(`- ${message}`));
    process.exit(1);
  }
  return env;
}
