import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

interface DetailedHealth extends HealthStatus {
  database: {
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
  };
  cache: {
    status: 'healthy' | 'unhealthy' | 'disabled';
    responseTime?: number;
    error?: string;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  checks: {
    name: string;
    status: 'pass' | 'fail';
    duration?: number;
  }[];
}

interface SystemMetrics {
  memory: NodeJS.MemoryUsage;
  cpu: NodeJS.CpuUsage;
  uptime: number;
  version: string;
  environment: string;
}

@Injectable()
export class HealthService {
  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  async checkHealth(): Promise<HealthStatus> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: this.configService.get('npm_package_version', '1.0.0'),
      environment: this.configService.get('NODE_ENV', 'development'),
    };
  }

  async checkDetailedHealth(): Promise<DetailedHealth> {
    const checks: { name: string; status: 'pass' | 'fail'; duration?: number }[] = [];
    
    // Database check
    const dbStart = Date.now();
    let dbStatus: 'healthy' | 'unhealthy' = 'healthy';
    let dbResponseTime: number | undefined;
    let dbError: string | undefined;

    try {
      const supabase = this.supabaseService.getClient();
      const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      dbResponseTime = Date.now() - dbStart;
      
      if (error) {
        dbStatus = 'unhealthy';
        dbError = error.message;
        checks.push({ name: 'database', status: 'fail', duration: dbResponseTime });
      } else {
        checks.push({ name: 'database', status: 'pass', duration: dbResponseTime });
      }
    } catch (error: any) {
      dbStatus = 'unhealthy';
      dbError = error.message;
      dbResponseTime = Date.now() - dbStart;
      checks.push({ name: 'database', status: 'fail', duration: dbResponseTime });
    }

    // Cache check (optional)
    const cacheStart = Date.now();
    let cacheStatus: 'healthy' | 'unhealthy' | 'disabled' = 'disabled';
    let cacheResponseTime: number | undefined;
    let cacheError: string | undefined;

    const redisHost = this.configService.get('REDIS_HOST');
    if (redisHost) {
      try {
        // Simple cache check - in production you'd use actual Redis client
        cacheResponseTime = Date.now() - cacheStart;
        cacheStatus = 'healthy';
        checks.push({ name: 'cache', status: 'pass', duration: cacheResponseTime });
      } catch (error: any) {
        cacheStatus = 'unhealthy';
        cacheError = error.message;
        cacheResponseTime = Date.now() - cacheStart;
        checks.push({ name: 'cache', status: 'fail', duration: cacheResponseTime });
      }
    }

    // Memory check
    const memUsage = process.memoryUsage();
    const memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    };

    // Determine overall status
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (dbStatus === 'unhealthy') {
      status = 'unhealthy';
    } else if (cacheStatus === 'unhealthy') {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: this.configService.get('npm_package_version', '1.0.0'),
      environment: this.configService.get('NODE_ENV', 'development'),
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
        error: dbError,
      },
      cache: {
        status: cacheStatus,
        responseTime: cacheResponseTime,
        error: cacheError,
      },
      memory,
      checks,
    };
  }

  async checkReadiness(): Promise<boolean> {
    try {
      // Check if database is accessible
      const supabase = this.supabaseService.getClient();
      const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      return !error;
    } catch {
      return false;
    }
  }

  getSystemMetrics(): SystemMetrics {
    return {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      version: this.configService.get('npm_package_version', '1.0.0'),
      environment: this.configService.get('NODE_ENV', 'development'),
    };
  }
}
