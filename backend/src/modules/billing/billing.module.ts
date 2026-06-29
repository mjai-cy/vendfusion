import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [BillingController],
})
export class BillingModule {}
