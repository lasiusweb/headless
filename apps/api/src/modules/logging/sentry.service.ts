import { Injectable, Logger, Inject, ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';

export interface SentryConfig {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate?: number;
}

@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);

  constructor(@Inject(REQUEST) private readonly request?: Request) {}

  /**
   * Initialize Sentry
   */
  static init(config: SentryConfig): void {
    if (!config.dsn) {
      Logger.warn('Sentry DSN not configured, error tracking disabled');
      return;
    }

    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      tracesSampleRate: config.tracesSampleRate || 0.1,
      integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
      ],
    });

    Logger.log('Sentry initialized successfully');
  }

  /**
   * Capture exception
   */
  captureException(exception: Error, context?: {
    userId?: string;
    userEmail?: string;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }): string | null {
    try {
      const scope = Sentry.getCurrentScope();

      // Set user context
      if (context?.userId || context?.userEmail) {
        scope.setUser({
          id: context.userId,
          email: context.userEmail,
        });
      }

      // Set tags
      if (context?.tags) {
        scope.setTags(context.tags);
      }

      // Set extra context
      if (context?.extra) {
        scope.setExtras(context.extra);
      }

      // Set request context if available
      if (this.request) {
        scope.setSDKProcessingMetadata({
          request: this.request,
        });
      }

      const eventId = Sentry.captureException(exception);
      this.logger.log(`Exception reported to Sentry: ${eventId}`);
      return eventId;
    } catch (error) {
      this.logger.error(`Failed to report to Sentry: ${error.message}`);
      return null;
    }
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'): string | null {
    try {
      const eventId = Sentry.captureMessage(message, level);
      this.logger.debug(`Message reported to Sentry: ${eventId}`);
      return eventId;
    } catch (error) {
      this.logger.error(`Failed to report message to Sentry: ${error.message}`);
      return null;
    }
  }

  /**
   * Set transaction for tracing
   */
  startTransaction(name: string, op: string = 'function') {
    const transaction = Sentry.startSpan({ name, op }, (span) => {
      return span;
    });
    return transaction;
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
    data?: Record<string, any>;
  }): void {
    Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Track performance metric
   */
  startTimer(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      // Sentry metrics API may vary by version, using fallback
      this.logger.debug(`${label}: ${duration}ms`);
    };
  }
}

/**
 * Global Sentry Exception Filter
 */
@Injectable()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  constructor(private readonly sentryService: SentryService) {}

  catch(exception: Error, host: ArgumentsHost): void {
    // Log to Sentry
    const eventId = this.sentryService.captureException(exception, {
      tags: {
        exception_type: exception.constructor.name,
      },
      extra: {
        stack: exception.stack,
      },
    });

    // Default handling
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = 500;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      eventId,
    });
  }
}
