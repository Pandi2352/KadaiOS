import { describe, expect, it } from 'vitest';
import { findEnvErrors } from './env.validation.js';

describe('findEnvErrors', () => {
  it('accepts valid values and missing values', () => {
    expect(findEnvErrors({})).toEqual([]);
    expect(findEnvErrors({ PORT: '8000', MONGODB_URI: 'mongodb://localhost:27017/x', CLIENT_ORIGINS: '*' })).toEqual(
      [],
    );
  });

  it('does not repeat a message', () => {
    const errors = findEnvErrors({ PORT: 'abc' });
    expect(errors).toHaveLength(new Set(errors).size);
  });

  it.each([
    [{ PORT: 'abc' }, 'PORT must be a whole number'],
    [{ PORT: '70000' }, 'PORT must be between 1 and 65535'],
    [{ MONGODB_URI: 'localhost:27017' }, 'MONGODB_URI must start with mongodb:// or mongodb+srv://'],
    [{ NODE_ENV: 'staging' }, 'NODE_ENV must be development, production or test'],
  ])('rejects %j', (env, message) => {
    expect(findEnvErrors(env)).toContain(message);
  });
});
