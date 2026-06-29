import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`[Auth] Sending OTP to ${email} via Supabase`);
    return this.supabaseService.sendOtp(email);
  }

  async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string; userId?: string }> {
    this.logger.log(`[Auth] Verifying OTP for ${email}`);
    return this.supabaseService.verifyOtp(email, otp);
  }
}
