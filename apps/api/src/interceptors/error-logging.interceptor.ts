import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoggingService } from '../modules/logging/logging.service';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  constructor(private loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id || null;
        const requestId = request.requestId || this.generateRequestId();

        // Log the error
        this.loggingService.logException(
          error,
          `${context.getClass().name}.${context.getHandler().name}`,
          userId,
          requestId
        );

        // Re-throw the error to maintain the original behavior
        return throwError(() => error);
      })
    );
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}