import { BadRequestException, ValidationPipe, type ValidationError } from '@nestjs/common';

/** Flattens nested errors into `{ 'address.city': ['message'] }` so forms can show them per field. */
export function collectFieldErrors(errors: ValidationError[], parent = ''): Record<string, string[]> {
  const fields: Record<string, string[]> = {};

  for (const error of errors) {
    const path = parent ? `${parent}.${error.property}` : error.property;
    if (error.constraints) {
      fields[path] = Object.values(error.constraints);
    }
    if (error.children?.length) {
      Object.assign(fields, collectFieldErrors(error.children, path));
    }
  }
  return fields;
}

export const createValidationPipe = (): ValidationPipe =>
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const fields = collectFieldErrors(errors);
      return new BadRequestException({ message: Object.values(fields).flat(), fields });
    },
  });
