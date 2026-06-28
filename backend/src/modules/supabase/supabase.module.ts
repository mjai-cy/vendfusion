import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global() // Make Supabase database connections globally available to other modules
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
