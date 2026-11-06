import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

afterEach(cleanup);

beforeAll(() => {
  // jsdom has no layout, so these browser features are stubbed. Browser checks cover the real ones.
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});
