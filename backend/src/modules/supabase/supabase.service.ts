import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private adminClient: SupabaseClient | null = null;

  // ─── Custom OTP store (in-memory, bypasses Supabase email entirely) ───────
  private otpStore = new Map<string, { otp: string; expiresAt: number }>();
  private pendingPasswords = new Map<string, { password: string; name: string; expiresAt: number }>();

  constructor() {}

  // ─── Nodemailer transporter for sending custom OTP emails ──────────────────
  private get mailTransporter(): nodemailer.Transporter {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!user || !pass) {
      this.logger.warn('[Mail] SMTP_USER or SMTP_PASS not set — OTP emails will fail.');
    }
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    const transporter = this.mailTransporter;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"xyz.ai" <noreply@xyzai.com>',
      to: email,
      subject: 'Your OTP for xyz.ai',
      text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#6366f1;">xyz.ai Verification</h2>
        <p>Your verification code is:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#6366f1;text-align:center;padding:16px;background:#f5f3ff;border-radius:8px;margin:16px 0">${otp}</div>
        <p style="color:#666;">This code expires in <strong>10 minutes</strong>.</p>
        <p style="color:#999;font-size:12px;">If you didn't request this, please ignore this email.</p>
      </div>`,
    });
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

  // ─── Auth: Sign up — sends real 6-digit OTP via SMTP (not Supabase email) ──
  async signUpWithPassword(email: string, password: string, name?: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[Auth] Signing up new user: ${email}`);
      const otp = this.generateOtp();
      await this.sendOtpEmail(email, otp);
      this.otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
      this.pendingPasswords.set(email, {
        password,
        name: name || email.split('@')[0],
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
      return { success: true, message: 'Verification OTP sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Auth] signup OTP send failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Send OTP for login — via SMTP, not Supabase ────────────────────
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`[Auth] Sending login OTP to ${email}`);
      const otp = this.generateOtp();
      await this.sendOtpEmail(email, otp);
      this.otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
      return { success: true, message: 'OTP sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Auth] sendOtp failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Auth: Verify custom OTP, then create/find user in Supabase Auth ──────
  async verifyOtp(email: string, token: string): Promise<{ success: boolean; message: string; userId?: string; name?: string }> {
    try {
      this.logger.log(`[Auth] Verifying OTP for ${email}`);

      // 1. Check custom OTP store
      const stored = this.otpStore.get(email);
      if (!stored) {
        return { success: false, message: 'No OTP sent to this email. Please request a new one.' };
      }
      if (Date.now() > stored.expiresAt) {
        this.otpStore.delete(email);
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }
      if (stored.otp !== token) {
        return { success: false, message: 'Invalid OTP code entered.' };
      }
      this.otpStore.delete(email);

      // 2. Check if this is a signup (has pending password) or login
      const pending = this.pendingPasswords.get(email);
      const name = pending?.name || email.split('@')[0];

      if (pending) {
        // ─── Signup: create user in Supabase Auth via admin API ──────────
        this.pendingPasswords.delete(email);
        let userId: string;
        try {
          const { data, error } = await this.adminSupabase.auth.admin.createUser({
            email,
            password: pending.password,
            email_confirm: true,
            user_metadata: { name },
          });
          if (error) throw error;
          userId = data.user.id;
        } catch (err: any) {
          // If admin key is missing or user already exists, try to get existing user
          this.logger.warn(`[Auth] admin.createUser failed (${err.message}), attempting to find existing user`);
          const existing = await this.findUserByEmail(email);
          if (existing) {
            userId = existing.id;
          } else {
            // Generate a local userId as fallback
            userId = crypto.randomUUID();
            this.logger.warn(`[Auth] Using local userId ${userId} for ${email} (not in Supabase Auth)`);
          }
        }
        await this.upsertUser(userId, email, name);
        return { success: true, message: 'Email verified', userId, name };
      } else {
        // ─── Login: find existing user ──────────────────────────────────
        // Check local DB first, then Supabase Auth
        const localUser = await this.findLocalUserByEmail(email);
        if (localUser) {
          return { success: true, message: 'Email verified', userId: localUser.id, name: localUser.name };
        }
        // Try Supabase Auth
        const authUser = await this.findUserByEmail(email);
        if (authUser) {
          const uid = authUser.id;
          const uname = authUser.user_metadata?.name || email.split('@')[0];
          await this.upsertUser(uid, email, uname);
          return { success: true, message: 'Email verified', userId: uid, name: uname };
        }
        return { success: false, message: 'No account found with this email. Please sign up first.' };
      }
    } catch (err: any) {
      this.logger.error(`[Auth] verifyOtp failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  private async findLocalUserByEmail(email: string): Promise<{ id: string; name: string } | null> {
    try {
      const { data, error } = await this.adminSupabase
        .from('users')
        .select('id, name')
        .eq('email', email)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    } catch {
      return null;
    }
  }

  private async findUserByEmail(email: string): Promise<{ id: string; user_metadata?: any } | null> {
    try {
      const result = await this.adminSupabase.auth.admin.listUsers();
      if (result.error) throw result.error;
      if (!result.data) throw new Error('No data returned');
      const user = result.data.users.find((u: any) => u.email === email);
      return user ? { id: user.id, user_metadata: user.user_metadata } : null;
    } catch {
      return null;
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
