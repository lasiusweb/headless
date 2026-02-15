import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_ANON_KEY');
    
    if (!url || !key) {
      // In a real app, you might want to throw an error or handle this more gracefully
      // For now, we'll just log or use empty strings to avoid crash during dev if env not set
    }
    
    this.client = createClient(url || '', key || '');
  }

  getClient() {
    return this.client;
  }
}
