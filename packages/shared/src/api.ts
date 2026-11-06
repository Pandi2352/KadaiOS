export const API_PREFIX = 'api';
export const API_VERSION = '1';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  /** Validation messages by field name. Only sent when a request fails validation. */
  fields?: Record<string, string[]>;
}

export interface ApiFailure {
  success: false;
  error: ApiErrorBody;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
