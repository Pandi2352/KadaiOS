import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Nest finds constructor dependencies through decorator metadata.
  oxc: {
    decorator: { legacy: true, emitDecoratorMetadata: true },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
