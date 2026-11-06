const DUPLICATE_KEY = 11000;

export const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === DUPLICATE_KEY;
