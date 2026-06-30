import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private adminClient: SupabaseClient | null = null;

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
      if (!url || !serviceKey || serviceKey === 'NEEDS_TO_BE_SET') {
        this.logger.warn('[Supabase] SUPABASE_SERVICE_ROLE_KEY not set — DB writes may fail due to RLS. Falling back to anon key.');
        return this.supabase;
      }
      this.adminClient = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
    return this.adminClient;
  }

  // ─── Auth: Sign up — sends confirmation link via Supabase Auth ─────────────
  async signUpWithPassword(email: string, password: string, name?: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[Auth] Signing up new user: ${email}`);
      const { error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`,
          data: { name: name || email.split('@')[0] },
        },
      });
      if (error) throw error;
      return { success: true, message: 'Confirmation link sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Auth] signUp failed: ${err.message}`);
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

  // ─── Auth: Forgot password — sends recovery link via Supabase ─────────────
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[Auth] Forgot password for ${email}`);
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`,
      });
      if (error) throw error;
      return { success: true, message: 'Password reset link sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Auth] resetPasswordForEmail failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Verify link clicked (confirmation or recovery) ─────────────────
  async verifyLink(accessToken: string): Promise<{ success: boolean; message: string; userId?: string; name?: string; email?: string }> {
    try {
      const { data, error } = await this.supabase.auth.getUser(accessToken);
      if (error) throw error;
      const user = data.user;
      if (!user || !user.email) throw new Error('No user found');

      const name = user.user_metadata?.name || user.email.split('@')[0];
      await this.upsertUser(user.id, user.email, name);
      return { success: true, message: 'Email verified', userId: user.id, name, email: user.email };
    } catch (err: any) {
      this.logger.error(`[Auth] verifyLink failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Update password (for reset-password flow) ──────────────────────
  async updatePassword(accessToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Create a temporary authed client using the access token from the recovery link
      const tempClient = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
      );
      const { error: sessionError } = await tempClient.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });
      if (sessionError) throw sessionError;

      const { error } = await tempClient.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true, message: 'Password updated successfully' };
    } catch (err: any) {
      this.logger.error(`[Auth] updatePassword failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Update password via admin client ─────────────────────────────────
  async adminUpdateUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[Supabase] Admin updating password for user ${userId}`);
      const { error } = await this.adminSupabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });
      if (error) throw error;
      return { success: true, message: 'Password updated successfully' };
    } catch (err: any) {
      this.logger.error(`[Supabase] adminUpdateUserPassword failed: ${err.message}`);
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
