import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SentryService } from './sentry.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private readonly sentryService: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;

    // Start Sentry transaction
    const transaction = Sentry.startTransaction({
      name: `${method} ${url}`,
      op: 'http.server',
      data: {
        method,
        url,
        body: this.sanitizeBody(body),
      },
    });

    // Set user context if available
    if (user?.id) {
      this.sentryService.setUser({
        id: user.id,
        email: user.email,
      });
    }

    // Set tags
    this.sentryService.setTag('method', method);
    this.sentryService.setTag('url', url);

    return next.handle().pipe(
      tap(() => {
        // Transaction success
        transaction.setStatus('ok');
      }),
      catchError((error) => {
        // Capture exception
        this.sentryService.captureException(error, {
          method,
          url,
          body: this.sanitizeBody(body),
        });

        // Transaction error
        transaction.setStatus('internal_error');
        transaction.setTag('error', error.message);

        return throwError(() => error);
      }),
      tap(() => {
        // Finish transaction
        transaction.finish();
      }),
    );
  }

  /**
   * Sanitize request body to remove sensitive data
   */
  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'creditCard', 'cvv'];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
