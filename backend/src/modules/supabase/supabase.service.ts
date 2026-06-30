import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private adminClient: SupabaseClient | null = null;
  private pendingPasswords = new Map<string, { password: string; name: string; expiresAt: number }>();

  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [email, data] of this.pendingPasswords) {
        if (now > data.expiresAt) this.pendingPasswords.delete(email);
      }
    }, 5 * 60 * 1000);
  }

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

  // ─── Auth: Sign up — sends OTP via Supabase Auth (signInWithOtp) ───────────
  async signUpWithPassword(email: string, password: string, name?: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[Auth] Signing up new user: ${email}`);
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      this.pendingPasswords.set(email, {
        password,
        name: name || email.split('@')[0],
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
      return { success: true, message: 'Verification OTP sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Auth] signInWithOtp failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Send OTP for login (via Supabase Auth) ─────────────────────────
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[Auth] Sending login OTP to ${email}`);
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
      return { success: true, message: 'OTP sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Auth] signInWithOtp failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Password-based login ───────────────────────────────────────────
  async signInWithPassword(email: string, password: string): Promise<{ success: boolean; message: string; userId?: string; name?: string }> {
    try {
      this.logger.log(`[Auth] Password login for ${email}`);
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error('Login failed — no user returned');
      const name = data.user?.user_metadata?.name || email.split('@')[0];
      await this.upsertUser(userId, email, name);
      return { success: true, message: 'Login successful', userId, name };
    } catch (err: any) {
      this.logger.error(`[Auth] signInWithPassword failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Forgot password — sends OTP via Supabase ───────────────────────
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[Auth] Forgot password OTP for ${email}`);
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true, message: 'Password reset OTP sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Auth] resetPasswordForEmail failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Verify OTP via Supabase Auth ────────────────────────────────────
  async verifyOtp(email: string, token: string): Promise<{ success: boolean; message: string; userId?: string; name?: string }> {
    try {
      this.logger.log(`[Auth] Verifying OTP for ${email}`);
      const { data, error } = await this.supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) throw new Error('Verification failed — no user returned from Supabase');

      const pending = this.pendingPasswords.get(email);
      const name = pending?.name || data.user?.user_metadata?.name || email.split('@')[0];

      if (pending) {
        this.pendingPasswords.delete(email);
        try {
          const { error: pwError } = await this.adminSupabase.auth.admin.updateUserById(userId, {
            password: pending.password,
            user_metadata: { name },
          });
          if (pwError) throw pwError;
          this.logger.log(`[Auth] Password set for ${email}`);
        } catch (err: any) {
          this.logger.warn(`[Auth] Could not set password (non-blocking): ${err.message}`);
        }
      }

      await this.upsertUser(userId, email, name);
      return { success: true, message: 'Email verified', userId, name };
    } catch (err: any) {
      this.logger.error(`[Auth] verifyOtp failed: ${err.message}`);
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
