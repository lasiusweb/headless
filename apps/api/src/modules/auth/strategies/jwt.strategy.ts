import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SupabaseService } from '../../../supabase/supabase.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  portal?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private supabaseService: SupabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret',
    });
  }

  async validate(payload: JwtPayload) {
    // Verify the user exists in Supabase
    const { data: { user }, error } = await this.supabaseService.getClient()
      .auth
      .getUser(payload.sub);

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'customer',
      portal: payload.portal || this.getPortalForRole(user.user_metadata?.role || 'customer'),
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
}