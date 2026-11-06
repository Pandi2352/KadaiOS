import { applyDecorators, HttpStatus, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto.js';

interface ApiEndpointOptions {
  summary: string;
  description?: string;
  /** The DTO inside `data`. For paginated routes, the DTO of each item. */
  response: Type<unknown>;
  /** Defaults to 200. */
  status?: HttpStatus.OK | HttpStatus.CREATED;
  /** Documents `data` as `{ items, total, page, limit }`. */
  paginated?: boolean;
  /** `data` can be null. */
  nullable?: boolean;
  /** The route validates a body or query, so it can return 400. */
  validates?: boolean;
  /** Name of a UUID route param. It also documents the 400 for an invalid UUID. */
  uuidParam?: string;
  /** Message for a documented 401. */
  unauthorized?: string;
  /** Entity name for a documented 404, such as "Shop". */
  notFound?: string;
  /** Message for a documented 409. */
  conflict?: string;
  /** The route is rate limited, so it can return 429. */
  rateLimited?: boolean;
  /** Message for a documented 503. */
  unavailable?: string;
}

const errorResponse = (status: HttpStatus, description: string, message: string | string[], extra: object = {}) =>
  ApiResponse({
    status,
    description,
    schema: {
      allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
      example: { success: false, error: { statusCode: status, message, ...extra } },
    },
  });

const paginatedSchema = (itemRef: string) => ({
  type: 'object',
  required: ['items', 'total', 'page', 'limit'],
  properties: {
    items: { type: 'array', items: { $ref: itemRef } },
    total: { type: 'integer', example: 1 },
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 20 },
  },
});

const dataSchema = (itemRef: string, paginated: boolean, nullable: boolean) => {
  if (paginated) return paginatedSchema(itemRef);
  return nullable ? { allOf: [{ $ref: itemRef }], nullable: true } : { $ref: itemRef };
};

/** Documents a route's summary, success format and possible errors in one place. */
export function ApiEndpoint({
  summary,
  description,
  response,
  status = HttpStatus.OK,
  paginated = false,
  nullable = false,
  validates = false,
  uuidParam,
  unauthorized,
  notFound,
  conflict,
  rateLimited = false,
  unavailable,
}: ApiEndpointOptions): MethodDecorator & ClassDecorator {
  const itemRef = getSchemaPath(response);

  return applyDecorators(
    ApiExtraModels(response, ErrorResponseDto),
    ApiOperation({ summary, description }),
    ApiResponse({
      status,
      description: status === HttpStatus.CREATED ? 'Created' : 'Success',
      schema: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: dataSchema(itemRef, paginated, nullable),
        },
      },
    }),
    ...(uuidParam ? [ApiParam({ name: uuidParam, type: String, format: 'uuid' })] : []),
    ...(validates
      ? [
          errorResponse(HttpStatus.BAD_REQUEST, 'Invalid input', ['Email must be a valid email address'], {
            fields: { email: ['Email must be a valid email address'] },
          }),
        ]
      : []),
    ...(uuidParam
      ? [errorResponse(HttpStatus.BAD_REQUEST, 'Invalid UUID', 'Validation failed (uuid is expected)')]
      : []),
    ...(unauthorized ? [errorResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized', unauthorized)] : []),
    ...(notFound ? [errorResponse(HttpStatus.NOT_FOUND, `${notFound} not found`, `${notFound} not found`)] : []),
    ...(conflict ? [errorResponse(HttpStatus.CONFLICT, 'Conflict', conflict)] : []),
    ...(rateLimited
      ? [errorResponse(HttpStatus.TOO_MANY_REQUESTS, 'Too many attempts', 'Too many attempts. Try again in a minute.')]
      : []),
    errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Server error', 'Something went wrong on the server'),
    ...(unavailable ? [errorResponse(HttpStatus.SERVICE_UNAVAILABLE, 'Unavailable', unavailable)] : []),
  );
}
