import { Injectable, Logger, Scope } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose'
}

export interface LogEntry {
  id?: string;
  level: LogLevel;
  message: string;
  module?: string;
  userId?: string;
  requestId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);

  constructor(private supabaseService: SupabaseService) {}

  async log(level: LogLevel, message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    const logEntry: LogEntry = {
      level,
      message,
      module: metadata?.module,
      userId,
      requestId,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        userAgent: metadata?.userAgent,
        ip: metadata?.ip,
        url: metadata?.url,
        method: metadata?.method,
      }
    };

    // Log to console for immediate visibility
    this.outputToConsole(level, message, metadata);

    // Store in database for persistence
    await this.storeLog(logEntry);

    return logEntry;
  }

  async error(message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    return this.log(LogLevel.ERROR, message, metadata, userId, requestId);
  }

  async warn(message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    return this.log(LogLevel.WARN, message, metadata, userId, requestId);
  }

  async info(message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    return this.log(LogLevel.INFO, message, metadata, userId, requestId);
  }

  async debug(message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    return this.log(LogLevel.DEBUG, message, metadata, userId, requestId);
  }

  async verbose(message: string, metadata?: Record<string, any>, userId?: string, requestId?: string) {
    return this.log(LogLevel.VERBOSE, message, metadata, userId, requestId);
  }

  private outputToConsole(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case LogLevel.ERROR:
        this.logger.error(logMessage, metadata);
        break;
      case LogLevel.WARN:
        this.logger.warn(logMessage, metadata);
        break;
      case LogLevel.INFO:
        this.logger.log(logMessage, metadata);
        break;
      case LogLevel.DEBUG:
        this.logger.debug(logMessage, metadata);
        break;
      case LogLevel.VERBOSE:
        this.logger.verbose(logMessage, metadata);
        break;
    }
  }

  private async storeLog(logEntry: LogEntry) {
    try {
      const { error } = await this.supabaseService.getClient()
        .from('logs')
        .insert([
          {
            level: logEntry.level,
            message: logEntry.message,
            module: logEntry.module,
            user_id: logEntry.userId,
            request_id: logEntry.requestId,
            timestamp: logEntry.timestamp,
            metadata: logEntry.metadata || {},
          }
        ]);

      if (error) {
        console.error('Error storing log in database:', error.message);
      }
    } catch (error) {
      console.error('Unexpected error storing log:', error);
    }
  }

  async getLogs(filters?: {
    level?: LogLevel;
    module?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabaseService.getClient()
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters?.level) {
      query = query.eq('level', filters.level);
    }

    if (filters?.module) {
      query = query.eq('module', filters.module);
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getErrorLogs(filters?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabaseService.getClient()
      .from('logs')
      .select('*')
      .eq('level', LogLevel.ERROR)
      .order('timestamp', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async createLogEntry(logData: {
    level: LogLevel;
    message: string;
    module?: string;
    userId?: string;
    requestId?: string;
    metadata?: Record<string, any>;
  }) {
    const logEntry: LogEntry = {
      level: logData.level,
      message: logData.message,
      module: logData.module,
      userId: logData.userId,
      requestId: logData.requestId,
      timestamp: new Date().toISOString(),
      metadata: logData.metadata,
    };

    await this.storeLog(logEntry);
    return logEntry;
  }

  // Log an exception with additional context
  async logException(exception: any, context: string, userId?: string, requestId?: string) {
    const errorLog = {
      level: LogLevel.ERROR,
      message: exception.message || 'Unknown error occurred',
      module: context,
      userId,
      requestId,
      timestamp: new Date().toISOString(),
      metadata: {
        stack: exception.stack,
        name: exception.name,
        code: exception.code,
        status: exception.status,
        url: exception.url,
        method: exception.method,
      }
    };

    this.outputToConsole(LogLevel.ERROR, errorLog.message, errorLog.metadata);
    await this.storeLog(errorLog);

    return errorLog;
  }

  // Log a business event
  async logBusinessEvent(eventType: string, eventData: any, userId?: string, requestId?: string) {
    const businessLog = {
      level: LogLevel.INFO,
      message: `Business event: ${eventType}`,
      module: 'business-logic',
      userId,
      requestId,
      timestamp: new Date().toISOString(),
      metadata: {
        eventType,
        ...eventData,
      }
    };

    this.outputToConsole(LogLevel.INFO, businessLog.message, businessLog.metadata);
    await this.storeLog(businessLog);

    return businessLog;
  }

  // Log an audit event
  async logAuditEvent(action: string, entity: string, entityId: string, userId: string, details?: any) {
    const auditLog = {
      level: LogLevel.INFO,
      message: `Audit: ${action} on ${entity} ${entityId}`,
      module: 'audit',
      userId,
      timestamp: new Date().toISOString(),
      metadata: {
        action,
        entity,
        entityId,
        details,
      }
    };

    this.outputToConsole(LogLevel.INFO, auditLog.message, auditLog.metadata);
    await this.storeLog(auditLog);

    return auditLog;
  }
}