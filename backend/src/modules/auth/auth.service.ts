import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async signUpWithPassword(email: string, password: string, name?: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`[Auth] Signing up user: ${email}`);
    return this.supabaseService.signUpWithPassword(email, password, name);
  }

  async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string; userId?: string; name?: string }> {
    this.logger.log(`[Auth] Verifying OTP for ${email}`);
    return this.supabaseService.verifyOtp(email, otp);
  }

  async signInWithPassword(email: string, password: string): Promise<{ success: boolean; message: string; userId?: string; name?: string }> {
    this.logger.log(`[Auth] Password login for ${email}`);
    return this.supabaseService.signInWithPassword(email, password);
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`[Auth] Forgot password for ${email}`);
    return this.supabaseService.forgotPassword(email);
  }
}
