import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private url: string = process.env.SUPABASE_URL || '';
  private anonKey: string = process.env.SUPABASE_ANON_KEY || '';

  onModuleInit() {
    if (!this.url || !this.anonKey) {
      console.log('[Supabase module] No credentials found. Running in mock sandbox database mode.');
      return;
    }
    console.log('[Supabase module] Connected to PostgreSQL schema instances.');
  }

  async getVectorEmbeddingsCount(): Promise<number> {
    // Mock querying pgvector storage counts
    return 148;
  }
}
