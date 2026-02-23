import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../../supabase/supabase.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  portal?: string; // b2b or b2c
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private supabaseService: SupabaseService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // In a real application, you would validate the user against your database
    // For now, we'll simulate this with Supabase Auth
    const { data, error } = await this.supabaseService.getClient()
      .auth
      .signInWithPassword({ email, password });

    if (error) {
      return null;
    }

    // Return user data without sensitive information
    // Note: We can't destructure password as it's not exposed by Supabase
    const { user } = data;
    return {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'customer',
      user_metadata: user.user_metadata,
    };
  }

  async login(user: any) {
    // Determine portal based on role
    const portal = this.getPortalForRole(user.role);
    
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      portal, // Include portal claim for middleware routing
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        portal,
      },
    };
  }

  /**
   * Map user roles to their respective portals
   */
  private getPortalForRole(role: string): string {
    const roleToPortal: Record<string, string> = {
      dealer: 'b2b',
      distributor: 'b2b',
      retailer: 'b2c',
      customer: 'b2c',
      farmer: 'b2c',
      admin: 'admin',
    };
    return roleToPortal[role] || 'b2c';
  }

  async register(userData: any) {
    // Register user with Supabase Auth
    const { data, error } = await this.supabaseService.getClient()
      .auth
      .signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || 'customer',
          }
        }
      });

    if (error) {
      throw new Error(error.message);
    }

    // Return user data (Supabase doesn't expose password)
    const { user } = data;
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'customer',
      user_metadata: user.user_metadata,
    };
  }
}