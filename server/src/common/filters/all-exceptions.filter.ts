import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ApiErrorBody, ApiFailure } from '@kadai/shared';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
    }

    const body: ApiFailure = { success: false, error: this.toErrorBody(exception) };
    response.status(body.error.statusCode).json(body);
  }

  private toErrorBody(exception: unknown): ApiErrorBody {
    if (!(exception instanceof HttpException)) {
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Something went wrong on the server' };
    }

    const statusCode = exception.getStatus();
    const body = exception.getResponse();
    if (typeof body !== 'object') {
      return { statusCode, message: exception.message };
    }

    const { message, fields } = body as Partial<Pick<ApiErrorBody, 'message' | 'fields'>>;
    return { statusCode, message: message ?? exception.message, ...(fields && { fields }) };
  }
}
