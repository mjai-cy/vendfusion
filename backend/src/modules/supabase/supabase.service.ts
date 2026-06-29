import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

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

  // ─── Auth: Send OTP via Supabase magic link ───────────────────────────────
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      this.logger.log(`[Supabase] OTP sent to ${email}`);
      return { success: true, message: 'OTP sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Supabase] sendOtp failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Verify OTP token ───────────────────────────────────────────────
  async verifyOtp(email: string, token: string): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      const { data, error } = await this.supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) throw error;
      this.logger.log(`[Supabase] OTP verified for ${email}`);
      return { success: true, message: 'Email verified', userId: data.user?.id };
    } catch (err: any) {
      this.logger.error(`[Supabase] verifyOtp failed: ${err.message}`);
      return { success: false, message: err.message };
    }
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
