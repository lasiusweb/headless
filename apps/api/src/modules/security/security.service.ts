import { Injectable, Logger, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService
  ) {}

  async logSecurityEvent(
    eventType: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>
  ) {
    const { error } = await this.supabaseService.getClient()
      .from('security_events')
      .insert([
        {
          event_type: eventType,
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          details: details || {},
          severity: this.getEventSeverity(eventType),
        }
      ]);

    if (error) {
      this.logger.error(`Error logging security event: ${error.message}`);
    }
  }

  async logAuditTrail(
    action: string,
    userId: string,
    resourceType: string,
    resourceId: string,
    oldValue?: any,
    newValue?: any,
    ipAddress?: string
  ) {
    const { error } = await this.supabaseService.getClient()
      .from('audit_trails')
      .insert([
        {
          action,
          user_id: userId,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValue || null,
          new_values: newValue || null,
          ip_address: ipAddress || null,
        }
      ]);

    if (error) {
      this.logger.error(`Error logging audit trail: ${error.message}`);
    }
  }

  async checkRateLimit(identifier: string, windowMs: number, maxRequests: number): Promise<boolean> {
    // In a real implementation, this would use Redis or a similar caching mechanism
    // For now, we'll simulate rate limiting
    
    // This would typically check against a cache like Redis
    // const key = `rate_limit:${identifier}`;
    // const current = await this.cacheManager.get(key);
    
    // For simulation purposes, we'll allow all requests
    return true;
  }

  async validateUserAccess(userId: string, resourceType: string, resourceId: string, action: string): Promise<boolean> {
    // Get user role and permissions
    const { data: user, error: userError } = await this.supabaseService.getClient()
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`User not found: ${userError.message}`);
    }

    // Check if user has access based on role and resource ownership
    if (resourceType === 'order' && action === 'read') {
      // Users can only read their own orders
      const { data: order, error: orderError } = await this.supabaseService.getClient()
        .from('orders')
        .select('user_id')
        .eq('id', resourceId)
        .single();

      if (orderError) {
        throw new Error(`Order not found: ${orderError.message}`);
      }

      // Allow if it's the user's order or if they're admin
      if (order.user_id === userId || user.role === 'admin') {
        return true;
      }
    } else if (resourceType === 'product' && action === 'read') {
      // All users can read products
      return true;
    } else if (user.role === 'admin') {
      // Admins have full access
      return true;
    }

    // Default: deny access
    return false;
  }

  async validateJwtToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async sanitizeInput(input: string): Promise<string> {
    // Basic sanitization to prevent XSS
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  async validateGstNumber(gstNumber: string): Promise<boolean> {
    // GST number format: 15 digits - first 2 for state code, next 10 for PAN, 1 for entity number, 1 for Z, 1 for checksum
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (!gstRegex.test(gstNumber)) {
      return false;
    }

    // Additional validation could be implemented here
    // For example, checking if the PAN portion is valid
    const pan = gstNumber.substring(2, 12);
    if (!this.isValidPan(pan)) {
      return false;
    }

    return true;
  }

  private isValidPan(pan: string): boolean {
    // PAN format: 5 letters, 4 numbers, 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  }

  private getEventSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const highRiskEvents = [
      'login_failed',
      'password_reset_failed',
      'unauthorized_access',
      'suspicious_activity',
      'data_export',
      'admin_action'
    ];

    const criticalEvents = [
      'brute_force_attempt',
      'multiple_login_failures',
      'sensitive_data_access',
      'admin_privilege_abuse'
    ];

    if (criticalEvents.includes(eventType)) {
      return 'critical';
    } else if (highRiskEvents.includes(eventType)) {
      return 'high';
    } else {
      return 'medium';
    }
  }

  async monitorSuspiciousActivity(userId: string, activity: string) {
    // In a real implementation, this would track user activities and detect anomalies
    // For now, we'll just log the activity
    
    const { data: recentEvents, error } = await this.supabaseService.getClient()
      .from('security_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      this.logger.error(`Error fetching recent events: ${error.message}`);
      return false;
    }

    // Check for suspicious patterns (e.g., multiple failed logins)
    const failedLogins = recentEvents?.filter(event => 
      event.event_type === 'login_failed'
    ).length || 0;

    if (failedLogins >= 5) {
      // Log suspicious activity
      await this.logSecurityEvent(
        'multiple_login_failures',
        userId,
        'unknown_ip', // In real implementation, this would be the actual IP
        'unknown_ua', // In real implementation, this would be the actual user agent
        { failedAttempts: failedLogins }
      );

      return true; // Flag as suspicious
    }

    return false;
  }

  async encryptSensitiveData(data: string): Promise<string> {
    // In a real implementation, this would use proper encryption
    // For now, we'll return the data as is but in a real app you'd use crypto
    return data;
  }

  async decryptSensitiveData(encryptedData: string): Promise<string> {
    // In a real implementation, this would decrypt the data
    // For now, we'll return the data as is
    return encryptedData;
  }

  async generateSecureToken(length: number = 32): Promise<string> {
    // In a real implementation, this would generate a cryptographically secure token
    // For now, we'll simulate with a basic implementation
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}