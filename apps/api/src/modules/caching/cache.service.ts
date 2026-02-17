import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL: number;
  private readonly redisEnabled: boolean;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.defaultTTL = this.configService.get<number>('CACHE_TTL', 3600);
    this.redisEnabled = !!this.configService.get('REDIS_URL');
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache hit: ${key}`);
      } else {
        this.logger.debug(`Cache miss: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache get error: ${error.message}`);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl || this.defaultTTL);
      this.logger.debug(`Cache set: ${key} (TTL: ${ttl || this.defaultTTL}s)`);
    } catch (error) {
      this.logger.error(`Cache set error: ${error.message}`);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache delete: ${key}`);
    } catch (error) {
      this.logger.error(`Cache delete error: ${error.message}`);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.log('Cache cleared');
    } catch (error) {
      this.logger.error(`Cache clear error: ${error.message}`);
    }
  }

  /**
   * Get or set value (with fallback function)
   */
  async getOrSet<T>(key: string, fallback: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fallback();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Cache keys patterns
   */
  static keys = {
    product: (id: string) => `product:${id}`,
    products: (filters?: any) => `products:${JSON.stringify(filters)}`,
    category: (id: string) => `category:${id}`,
    categories: () => 'categories:all',
    cart: (userId: string) => `cart:${userId}`,
    user: (id: string) => `user:${id}`,
    order: (id: string) => `order:${id}`,
    orders: (userId: string) => `orders:${userId}`,
    inventory: (productId: string) => `inventory:${productId}`,
    pricing: (userId: string, productId: string) => `pricing:${userId}:${productId}`,
    loyalty: (userId: string) => `loyalty:${userId}`,
    analytics: (type: string, period: string) => `analytics:${type}:${period}`,
    forecast: (productId: string, days: number) => `forecast:${productId}:${days}`,
  };
}
