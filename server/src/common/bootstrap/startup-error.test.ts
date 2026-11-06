import { describe, expect, it } from 'vitest';
import { describeStartupError } from './startup-error.js';

describe('describeStartupError', () => {
  it('gives a next step when MongoDB is unavailable', () => {
    const error = Object.assign(new Error('connect ECONNREFUSED'), { name: 'MongooseServerSelectionError' });
    expect(describeStartupError(error)).toContain('Could not connect to MongoDB');
  });

  it('explains a port in use', () => {
    const error = Object.assign(new Error('listen'), { code: 'EADDRINUSE' });
    expect(describeStartupError(error)).toContain('port is already in use');
  });

  it('keeps the stack for anything unexpected', () => {
    expect(describeStartupError(new Error('boom'))).toContain('boom');
  });
});
