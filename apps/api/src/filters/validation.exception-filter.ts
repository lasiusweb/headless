import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';
import { Response as SupabaseResponse } from '@supabase/supabase-js';
import { LoggingService } from '../modules/logging/logging.service';

@Catch(ValidationError)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  constructor(private loggingService: LoggingService) {}

  catch(exception: ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const userId = ctx.getRequest().user?.id || null;
    const requestId = this.generateRequestId();

    // Log the validation error
    this.loggingService.warn(
      'Validation error occurred',
      {
        module: 'ValidationExceptionFilter',
        url: request.url,
        method: request.method,
        validationErrors: exception.constraints,
      },
      userId,
      requestId
    );

    const errorResponse = {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      error: 'Validation Error',
      message: 'The request contains invalid data',
      details: exception.constraints,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };

    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json(errorResponse);
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}