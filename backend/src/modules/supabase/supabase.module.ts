import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { OutreachModule } from '../outreach/outreach.module';

@Module({
  imports: [OutreachModule],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
