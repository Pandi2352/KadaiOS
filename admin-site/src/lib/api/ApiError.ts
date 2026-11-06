import type { ApiErrorBody } from '@kadai/shared';

export const NETWORK_ERROR_MESSAGE = "Can't reach the server. Check your connection and try again.";

/** Thrown by apiRequest for every failed call. statusCode is 0 when the server couldn't be reached. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly fields: Record<string, string[]>;

  constructor({ statusCode, message, fields }: ApiErrorBody) {
    super(Array.isArray(message) ? message.join(' ') : message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.fields = fields ?? {};
  }
}

export const getErrorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : 'Something went wrong. Try again.';
