import { Injectable, Inject, PLATFORM_ID } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { env } from '../config/env.schema';

@Injectable()
export class SentryService {
  constructor(@Inject(PLATFORM_ID) private platformId: string) {
    if (env.SENTRY_DSN) {
      Sentry.init({
        dsn: env.SENTRY_DSN,
        environment: env.NODE_ENV,
        tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
        profilesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
          new ProfilingIntegration(),
        ],
        beforeSend(event, hint) {
          // Exclude health check errors
          if (event.request?.url?.includes('/health')) {
            return null;
          }
          return event;
        },
        beforeBreadcrumb(breadcrumb) {
          // Exclude verbose breadcrumbs in production
          if (env.NODE_ENV === 'production' && breadcrumb.category === 'console') {
            return null;
          }
          return breadcrumb;
        },
      });
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: { [key: string]: any }) {
    if (env.SENTRY_DSN) {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setContext('custom', context);
        }
        Sentry.captureException(error);
      });
    }
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level?: Sentry.SeverityLevel, context?: { [key: string]: any }) {
    if (env.SENTRY_DSN) {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setContext('custom', context);
        }
        Sentry.captureMessage(message, level);
      });
    }
  }

  /**
   * Set user for error tracking
   */
  setUser(user: { id: string; email?: string; username?: string }) {
    if (env.SENTRY_DSN) {
      Sentry.setUser(user);
    }
  }

  /**
   * Set tag for filtering
   */
  setTag(key: string, value: string) {
    if (env.SENTRY_DSN) {
      Sentry.setTag(key, value);
    }
  }

  /**
   * Set custom context
   */
  setContext(name: string, context: { [key: string]: any }) {
    if (env.SENTRY_DSN) {
      Sentry.setContext(name, context);
    }
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
    if (env.SENTRY_DSN) {
      Sentry.addBreadcrumb(breadcrumb);
    }
  }

  /**
   * Start a transaction for performance monitoring
   */
  startTransaction(name: string, op: string) {
    if (env.SENTRY_DSN) {
      return Sentry.startTransaction({ name, op });
    }
    return null;
  }

  /**
   * Get Sentry ID for reference
   */
  getLastEventId() {
    return Sentry.lastEventId();
  }

  /**
   * Flush pending events
   */
  async close(timeout: number = 2000) {
    if (env.SENTRY_DSN) {
      await Sentry.close(timeout);
    }
  }
}
