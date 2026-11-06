import { describe, expect, it } from 'vitest';
import { EXAMPLE_ADMIN_PASSWORD, findEnvErrors } from './env.validation.js';

const VALID = { JWT_ACCESS_SECRET: 'x'.repeat(32) };

describe('findEnvErrors', () => {
  it('accepts valid values and missing optional values', () => {
    expect(findEnvErrors(VALID)).toEqual([]);
    expect(
      findEnvErrors({ ...VALID, PORT: '8000', MONGODB_URI: 'mongodb://localhost:27017/x', CLIENT_ORIGINS: '*' }),
    ).toEqual([]);
  });

  it('does not repeat a message', () => {
    const errors = findEnvErrors({ ...VALID, PORT: 'abc' });
    expect(errors).toHaveLength(new Set(errors).size);
  });

  it.each([
    [{ PORT: 'abc' }, 'PORT must be a whole number'],
    [{ PORT: '70000' }, 'PORT must be between 1 and 65535'],
    [{ MONGODB_URI: 'localhost:27017' }, 'MONGODB_URI must start with mongodb:// or mongodb+srv://'],
    [{ NODE_ENV: 'staging' }, 'NODE_ENV must be development, production or test'],
    [{ DEFAULT_ADMIN_EMAIL: 'nope' }, 'DEFAULT_ADMIN_EMAIL must be a valid email address'],
    [{ DEFAULT_ADMIN_PASSWORD: 'short' }, 'DEFAULT_ADMIN_PASSWORD must have at least 8 characters'],
  ])('rejects %j', (env, message) => {
    expect(findEnvErrors({ ...VALID, ...env })).toContain(message);
  });

  it('requires a JWT secret', () => {
    expect(findEnvErrors({})).toContain('JWT_ACCESS_SECRET is required');
  });

  it('rejects a short JWT secret and says how to create one', () => {
    const [message] = findEnvErrors({ JWT_ACCESS_SECRET: 'short' });
    expect(message).toContain('at least 32 characters');
    expect(message).toContain('randomBytes');
  });

  it('allows the example admin password only outside production', () => {
    const env = { ...VALID, DEFAULT_ADMIN_PASSWORD: EXAMPLE_ADMIN_PASSWORD };
    expect(findEnvErrors(env)).toEqual([]);
    expect(findEnvErrors({ ...env, NODE_ENV: 'production' })).toContain(
      'DEFAULT_ADMIN_PASSWORD must not be the example password in production',
    );
  });
});
