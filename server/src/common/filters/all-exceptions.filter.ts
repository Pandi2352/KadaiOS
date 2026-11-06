import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!isHttp) {
      this.logger.error(exception);
    }

    response.status(statusCode).json({
      success: false,
      error: { statusCode, message: isHttp ? this.readMessage(exception) : 'Something went wrong on the server' },
    });
  }

  private readMessage(exception: HttpException): string | string[] {
    const body = exception.getResponse();
    return typeof body === 'object' && 'message' in body ? (body.message as string | string[]) : exception.message;
  }
}
