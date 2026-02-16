import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SupabaseService } from '../../../supabase/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private supabaseService: SupabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret',
    });
  }

  async validate(payload: any) {
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
      role: user.user_metadata?.role || 'customer' 
    };
  }
}