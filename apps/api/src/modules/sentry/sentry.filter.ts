import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { SentryService } from './sentry.service';
import { env } from '../config/env.schema';

@Catch()
export class SentryFilter implements ExceptionFilter {
  constructor(private readonly sentryService: SentryService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Capture exception in Sentry
    this.sentryService.captureException(exception as Error, {
      url: request.url,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    // Get Sentry event ID
    const eventId = this.sentryService.getLastEventId();

    // Determine status code
    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && (exceptionResponse as any).message) {
        message = (exceptionResponse as any).message;
      }
    }

    // Don't expose internal errors in production
    if (env.NODE_ENV === 'production' && status === 500) {
      message = 'An unexpected error occurred';
    }

    // Send response
    response.status(status).json({
      statusCode: status,
      message,
      eventId: env.NODE_ENV !== 'production' ? eventId : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
