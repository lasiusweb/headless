import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { LoggingService } from '../logging/logging.service';

// Rate limiter configuration
const createRateLimiter = (points: number, duration: number) => {
  return new RateLimiterMemory({
    points, // Number of requests
    duration, // Per duration in seconds
    blockDuration: 60, // Block for 1 minute if limit exceeded
  });
};

// Default rate limiters
const defaultLimiter = createRateLimiter(100, 60); // 100 requests per minute
const authLimiter = createRateLimiter(5, 60); // 5 auth attempts per minute
const apiLimiter = createRateLimiter(300, 60); // 300 API requests per minute

export const RateLimit = (options?: { points?: number; duration?: number; key?: string }) => {
  return Reflect.metadata('rate_limit', options || {});
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private logger: LoggingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const route = this.reflector.get<string>('route', context.getHandler());
    
    // Get rate limit metadata from route
    const rateLimitOptions = this.reflector.get<{
      points?: number;
      duration?: number;
      key?: string;
    }>('rate_limit', context.getHandler());

    // Select appropriate limiter based on route
    let limiter = defaultLimiter;
    if (route?.includes('auth')) {
      limiter = authLimiter;
    } else if (route?.includes('api')) {
      limiter = apiLimiter;
    }

    // Override with custom options if provided
    if (rateLimitOptions) {
      limiter = createRateLimiter(
        rateLimitOptions.points || 100,
        rateLimitOptions.duration || 60,
      );
    }

    // Get user identifier (IP or user ID)
    const key = this.getKey(request);

    try {
      const res = await limiter.consume(key);
      
      // Set rate limit headers
      response.setHeader('X-RateLimit-Limit', limiter.points);
      response.setHeader('X-RateLimit-Remaining', res.remainingPoints);
      response.setHeader('X-RateLimit-Reset', new Date(Date.now() + res.msBeforeNext).getTime());

      return true;
    } catch (rejRes: any) {
      if (rejRes instanceof RateLimiterRes) {
        // Log rate limit exceeded
        await this.logger.warn('Rate limit exceeded', {
          key,
          route: request.url,
          method: request.method,
          ip: request.ip,
          retryAfter: rejRes.msBeforeNext / 1000,
        });

        // Set rate limit headers
        response.setHeader('X-RateLimit-Limit', limiter.points);
        response.setHeader('X-RateLimit-Remaining', 0);
        response.setHeader('X-RateLimit-Reset', new Date(Date.now() + rejRes.msBeforeNext).getTime());
        response.setHeader('Retry-After', Math.ceil(rejRes.msBeforeNext / 1000));

        // Return 429 Too Many Requests
        response.status(HttpStatus.TOO_MANY_REQUESTS).json({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          error: 'Too Many Requests',
          retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
        });

        return false;
      }

      throw rejRes;
    }
  }

  private getKey(request: any): string {
    // Use user ID if authenticated, otherwise use IP
    const userId = request.user?.id;
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    return userId ? `user:${userId}` : `ip:${ip}`;
  }
}
