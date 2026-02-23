import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '../logging/logging.service';

export interface RequestLog {
  method: string;
  url: string;
  path: string;
  query?: any;
  body?: any;
  headers?: any;
  ip: string;
  userAgent?: string;
  userId?: string;
  responseTime?: number;
  statusCode?: number;
}

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private logger: LoggingService) {}

  use(request: Request, response: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, url, path, query, body, headers } = request;
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'];
    const userId = (request as any).user?.id;

    // Log request
    const requestLog: RequestLog = {
      method,
      url,
      path,
      query: this.sanitize(query),
      body: this.sanitize(body),
      headers: this.sanitizeHeaders(headers),
      ip,
      userAgent,
      userId,
    };

    // Log at debug level (not too verbose)
    this.logger.debug(`${method} ${path}`, requestLog);

    // Log response on finish
    response.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = response.statusCode;

      const logData = {
        ...requestLog,
        responseTime: duration,
        statusCode,
      };

      // Log based on status code
      if (statusCode >= 500) {
        this.logger.error(`${method} ${path} - ${statusCode}`, logData);
      } else if (statusCode >= 400) {
        this.logger.warn(`${method} ${path} - ${statusCode}`, logData);
      } else if (statusCode >= 200 && statusCode < 300) {
        this.logger.info(`${method} ${path} - ${statusCode} (${duration}ms)`, logData);
      } else {
        this.logger.debug(`${method} ${path} - ${statusCode} (${duration}ms)`, logData);
      }
    });

    next();
  }

  /**
   * Sanitize query parameters to remove sensitive data
   */
  private sanitize(obj: any): any {
    if (!obj) return undefined;
    
    const sensitive = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...obj };

    for (const key of Object.keys(sanitized)) {
      if (sensitive.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Sanitize headers to remove sensitive data
   */
  private sanitizeHeaders(headers: any): any {
    if (!headers) return undefined;

    const sensitive = ['authorization', 'cookie', 'set-cookie'];
    const sanitized: any = {};

    for (const [key, value] of Object.entries(headers)) {
      if (sensitive.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
