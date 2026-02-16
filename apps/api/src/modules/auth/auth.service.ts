import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../../supabase/supabase.service';

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
    const { password: _, ...result } = data.user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
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

    // Return user data
    const { password: _, ...user } = data.user;
    return user;
  }
}