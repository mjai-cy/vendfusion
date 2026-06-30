import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private adminClient: SupabaseClient | null = null;
  private pendingPasswords = new Map<string, { password: string; name: string; expiresAt: number }>();

  constructor() {}

  // ─── Anon client — used only for Auth operations ──────────────────────────
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

  // ─── Service-role client — bypasses RLS, used for all DB writes ──────────
  private get adminSupabase(): SupabaseClient {
    if (!this.adminClient) {
      const url = process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceKey) {
        this.logger.warn('[Supabase] SUPABASE_SERVICE_ROLE_KEY not set — DB writes may fail due to RLS. Falling back to anon key.');
        return this.supabase;
      }
      this.adminClient = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
    return this.adminClient;
  }

  // ─── Auth: Sign up new user — sends real OTP via signInWithOtp (not a confirmation link) ──
  async signUpWithPassword(email: string, password: string, name?: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[Supabase Auth] Signing up new user: ${email}`);
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      // Store password + name temporarily to set after OTP verification
      this.pendingPasswords.set(email, {
        password,
        name: name || email.split('@')[0],
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
      return { success: true, message: 'Verification OTP sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Supabase Auth] signInWithOtp failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Send OTP (for login flow) ──────────────────────────────────────
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[Supabase Auth] Sending login OTP to ${email}`);
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false }, // login only — user must sign up first
      });
      if (error) throw error;
      return { success: true, message: 'OTP sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Supabase Auth] signInWithOtp failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Verify OTP token via Supabase Auth ──────────────────────────────
  async verifyOtp(email: string, token: string): Promise<{ success: boolean; message: string; userId?: string; name?: string }> {
    try {
      this.logger.log(`[Supabase Auth] Verifying token for ${email}`);
      const { data, error } = await this.supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) throw new Error('Verification failed — no user returned from Supabase');

      // If there's a pending password from signup, set it now
      const pending = this.pendingPasswords.get(email);
      const name = pending?.name || data.user?.user_metadata?.name || email.split('@')[0];
      if (pending) {
        try {
          const { error: pwError } = await this.adminSupabase.auth.admin.updateUserById(userId, {
            password: pending.password,
            user_metadata: { name },
          });
          if (pwError) throw pwError;
          this.logger.log(`[Supabase Auth] Password set for ${email}`);
        } catch (err: any) {
          this.logger.warn(`[Supabase Auth] Could not set password (non-blocking): ${err.message}`);
        }
        this.pendingPasswords.delete(email);
      }

      await this.upsertUser(userId, email, name);
      return { success: true, message: 'Email verified', userId, name };
    } catch (err: any) {
      this.logger.error(`[Supabase Auth] verifyOtp failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── DB: Upsert user profile (uses service-role key to bypass RLS) ───────
  async upsertUser(userId: string, email: string, name: string, plan: string = 'none') {
    try {
      const { error } = await this.adminSupabase
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
      const { data, error } = await this.adminSupabase
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

  // ─── DB: Record pending payment (requires admin verification) ────────────
  async recordPendingPayment(email: string, method: string, reference: string): Promise<void> {
    try {
      const { error } = await this.adminSupabase
        .from('payments')
        .insert({
          email,
          method,
          reference,
          status: 'pending',
          amount: 1299,
          currency: 'INR',
          created_at: new Date().toISOString(),
        });
      if (error) {
        // Table may not exist yet — log and continue (non-blocking)
        this.logger.warn(`[Supabase] payments table may not exist: ${error.message}`);
      }
    } catch (err: any) {
      this.logger.warn(`[Supabase] recordPendingPayment failed (non-blocking): ${err.message}`);
    }
  }

  // ─── DB: Check if UTR/reference already used ─────────────────────────────
  async isPaymentReferenceUsed(reference: string): Promise<boolean> {
    try {
      const { data } = await this.adminSupabase
        .from('payments')
        .select('id')
        .eq('reference', reference)
        .maybeSingle();
      return !!data;
    } catch {
      return false; // If table doesn't exist, allow (non-blocking)
    }
  }

  // ─── DB: Activate Pro plan (admin-verified payments only) ────────────────
  async activateProPlan(email: string): Promise<void> {
    try {
      const { error } = await this.adminSupabase
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
      const { error } = await this.adminSupabase
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
      const { data, error } = await this.adminSupabase
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
