import { Logger } from '@nestjs/common';
import { plainToInstance, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min, validateSync } from 'class-validator';

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
}

export function findEnvErrors(env: Record<string, unknown>): string[] {
  const values = plainToInstance(EnvironmentVariables, env);
  const messages = validateSync(values).flatMap((error) => Object.values(error.constraints ?? {}));
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
