import { ServiceUnavailableException } from '@nestjs/common';
import mongoose, { type Connection } from 'mongoose';
import { describe, expect, it } from 'vitest';
import { HealthService } from './health.service.js';

const withState = (readyState: number) => new HealthService({ readyState } as unknown as Connection);

describe('HealthService', () => {
  it('reports connected', () => {
    expect(withState(mongoose.ConnectionStates.connected).check()).toEqual({ database: 'connected' });
  });

  it.each([mongoose.ConnectionStates.disconnected, mongoose.ConnectionStates.connecting])(
    'throws 503 in state %s',
    (state) => {
      expect(() => withState(state).check()).toThrow(ServiceUnavailableException);
    },
  );
});
