import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from '../modules/logging/logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const userId = request.user?.id || null;
    const method = context.getHandler().name;
    const controller = context.getClass().name;
    const startTime = Date.now();

    const requestId = this.generateRequestId();
    request.requestId = requestId; // Add request ID to request object

    // Log the incoming request
    this.loggingService.info(
      `Incoming request: ${request.method} ${request.url}`,
      {
        module: 'RequestLogging',
        method: request.method,
        url: request.url,
        userId,
        controller,
        handler: method,
        requestId,
        userAgent: request.get('user-agent'),
        ip: request.ip,
      },
      userId,
      requestId
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          // Log successful response
          this.loggingService.info(
            `Request completed: ${request.method} ${request.url}`,
            {
              module: 'ResponseLogging',
              method: request.method,
              url: request.url,
              userId,
              controller,
              handler: method,
              requestId,
              statusCode: response.statusCode,
              duration: `${duration}ms`,
              dataSize: JSON.stringify(data).length,
            },
            userId,
            requestId
          );
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          // Log error response
          this.loggingService.error(
            `Request failed: ${request.method} ${request.url}`,
            {
              module: 'ErrorLogging',
              method: request.method,
              url: request.url,
              userId,
              controller,
              handler: method,
              requestId,
              statusCode: response.statusCode,
              duration: `${duration}ms`,
              error: error.message,
              stack: error.stack,
            },
            userId,
            requestId
          );
        }
      })
    );
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}