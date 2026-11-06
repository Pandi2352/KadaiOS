import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

afterEach(cleanup);

beforeAll(() => {
  // jsdom has no layout, so this is stubbed. Browser checks cover the real thing.
  Element.prototype.scrollIntoView = vi.fn();
});
