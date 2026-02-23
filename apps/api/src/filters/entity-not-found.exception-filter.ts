import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { LoggingService, LogLevel } from '../modules/logging/logging.service';

@Catch(EntityNotFoundError)
export class EntityNotFoundExceptionFilter implements ExceptionFilter {
  constructor(private loggingService: LoggingService) {}

  catch(exception: EntityNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const userId = ctx.getRequest().user?.id || null;
    const requestId = this.generateRequestId();

    // Log the exception
    this.loggingService.log(
      LogLevel.WARN,
      `Entity not found: ${exception.message}`,
      {
        module: 'EntityNotFoundExceptionFilter',
        url: request.url,
        method: request.method,
      },
      userId,
      requestId
    );

    const errorResponse = {
      statusCode: HttpStatus.NOT_FOUND,
      error: 'Entity Not Found',
      message: exception.message || 'Requested entity not found',
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };

    response.status(HttpStatus.NOT_FOUND).json(errorResponse);
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}