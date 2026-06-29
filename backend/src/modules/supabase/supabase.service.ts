import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OutreachService } from '../outreach/outreach.service';

interface OtpMemory {
  otp: string;
  expiresAt: number;
}

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private otpMap = new Map<string, OtpMemory>();

  constructor(private readonly outreachService: OutreachService) {}

  private get supabase(): SupabaseClient {
    if (!this.client) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_ANON_KEY;
      if (!url || !key) throw new Error('Supabase credentials not configured');
      this.client = createClient(url, key, {
        auth: { autoRefreshToken: true, persistSession: false },
      });
    }
    return this.client;
  }

  // ─── Auth: Send OTP via custom SMTP using credentials in .env ───────────────
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity
      this.otpMap.set(email.toLowerCase(), { otp, expiresAt });

      const emailSubject = "Verify your xyz.ai account";
      const emailBody = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #1a1a1a; background-color: #030303; color: #ffffff; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center; margin-bottom: 20px;">xyz.ai Security</h2>
          <p style="font-size: 14px; color: #d1d5db;">Please use the following 6-digit verification code to complete your access to the platform:</p>
          <div style="font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 4px; padding: 15px; background-color: #0f0f18; border: 1px solid #2d2d3d; border-radius: 6px; margin: 25px 0; color: #6366f1;">
            ${otp}
          </div>
          <p style="font-size: 11px; color: #6b7280; text-align: center;">This verification code is valid for the next 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `;

      const mailSent = await this.outreachService.sendEmail(email, emailSubject, emailBody);
      if (!mailSent) {
        throw new Error('SMTP delivery failure');
      }

      this.logger.log(`[Supabase OTP Custom] Real verification email sent successfully to ${email}`);
      return { success: true, message: 'OTP sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Supabase OTP Custom] sendOtp failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Verify Custom OTP token ─────────────────────────────────────────
  async verifyOtp(email: string, token: string): Promise<{ success: boolean; message: string; userId?: string }> {
    const key = email.toLowerCase();
    const activeOtp = this.otpMap.get(key);

    if (!activeOtp) {
      this.logger.warn(`[Supabase OTP Custom] Verification failed: No active code for ${email}`);
      return { success: false, message: 'No verification request active for this email' };
    }

    if (Date.now() > activeOtp.expiresAt) {
      this.otpMap.delete(key);
      this.logger.warn(`[Supabase OTP Custom] Verification failed: Code expired for ${email}`);
      return { success: false, message: 'Verification code has expired' };
    }

    if (activeOtp.otp !== token) {
      this.logger.warn(`[Supabase OTP Custom] Verification failed: Invalid code for ${email}`);
      return { success: false, message: 'Invalid verification code' };
    }

    // Success! Clear it and return success
    this.otpMap.delete(key);
    
    // Auto-create or fetch user account in Supabase Database
    const userId = `usr_${Date.now()}`;
    await this.upsertUser(userId, email, email.split('@')[0]);

    this.logger.log(`[Supabase OTP Custom] Real verification successful for ${email}`);
    return { success: true, message: 'Email verified', userId };
  }

  // ─── DB: Upsert user profile ──────────────────────────────────────────────
  async upsertUser(userId: string, email: string, name: string, plan: string = 'none') {
    try {
      const { error } = await this.supabase
        .from('users')
        .upsert({ id: userId, email, name, plan, updated_at: new Date().toISOString() });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      this.logger.error(`[Supabase] upsertUser failed: ${err.message}`);
      return { success: false };
    }
  }

  // ─── DB: Get user plan ────────────────────────────────────────────────────
  async getUserPlan(userId: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('plan')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data?.plan || 'none';
    } catch {
      return 'none';
    }
  }

  // ─── DB: Activate Pro plan (called from Stripe webhook) ──────────────────
  async activateProPlan(email: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({ plan: 'pro', updated_at: new Date().toISOString() })
        .eq('email', email);
      if (error) throw error;
      this.logger.log(`[Supabase] Pro plan activated for ${email}`);
    } catch (err: any) {
      this.logger.error(`[Supabase] activateProPlan failed: ${err.message}`);
    }
  }

  // ─── DB: Save workspace + leads ──────────────────────────────────────────
  async saveWorkspace(userId: string, workspace: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('workspaces')
        .upsert({ id: workspace.id, user_id: userId, data: workspace, updated_at: new Date().toISOString() });
      if (error) throw error;
    } catch (err: any) {
      this.logger.error(`[Supabase] saveWorkspace failed: ${err.message}`);
    }
  }

  // ─── DB: Load workspaces for user ────────────────────────────────────────
  async getWorkspaces(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('workspaces')
        .select('data')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => row.data);
    } catch {
      return [];
    }
  }
}
