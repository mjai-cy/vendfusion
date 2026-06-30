import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupabaseService } from '../supabase/supabase.service';
import { OutreachService } from '../outreach/outreach.service';
import { User } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly outreachService: OutreachService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Generate a secure 6-digit verification code
  private generateSixDigitOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // ─── Sign Up with Password ────────────────────────────────────────────────
  async signUpWithPassword(email: string, password: string, name?: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`[Auth] Custom SignUp process for ${email}`);
    
    try {
      // 1. Sign up user in Supabase Auth first
      const supabaseResult = await this.supabaseService.signUpWithPassword(email, password);
      if (!supabaseResult.success) {
        return { success: false, message: supabaseResult.message };
      }

      // 2. Locate or create the user in our local database
      let user = await this.userRepo.findOne({ where: { email: email.toLowerCase().trim() } });
      if (!user) {
        user = this.userRepo.create({
          email: email.toLowerCase().trim(),
          name: name || email.split('@')[0],
          plan: 'none',
          isEmailVerified: false,
        });
      }

      // 3. Generate and store custom OTP
      const otp = this.generateSixDigitOtp();
      user.otpCode = otp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
      await this.userRepo.save(user);

      // 4. Send the OTP email directly via our verified backend SMTP transporter
      const emailSubject = 'Verify your xyz.ai account';
      const emailBody = `Hi ${user.name},\n\nThank you for signing up for xyz.ai!\n\nYour 6-digit verification OTP code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nThe xyz.ai Team`;
      
      const sent = await this.outreachService.sendEmail(email, emailSubject, emailBody);
      if (!sent) {
        this.logger.error(`[Auth] Failed to send custom signup OTP email to ${email}`);
        return { success: false, message: 'Account created, but failed to send verification email. Please try logging in to resend.' };
      }

      this.logger.log(`[Auth] Custom signup OTP email sent successfully to ${email}`);
      return { success: true, message: 'Verification OTP sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Auth] signUpWithPassword error: ${err.message}`);
      return { success: false, message: err.message || 'An unexpected error occurred during signup' };
    }
  }

  // ─── Sign In with Password ────────────────────────────────────────────────
  async signInWithPassword(email: string, password: string): Promise<{ success: boolean; message: string; userId?: string; name?: string }> {
    this.logger.log(`[Auth] Custom SignIn process for ${email}`);
    try {
      const result = await this.supabaseService.signInWithPassword(email, password);
      if (!result.success) {
        return { success: false, message: result.message };
      }

      // Ensure user is in our public database
      const trimmedEmail = email.toLowerCase().trim();
      let user = await this.userRepo.findOne({ where: { email: trimmedEmail } });
      if (!user) {
        user = this.userRepo.create({
          email: trimmedEmail,
          name: result.name || email.split('@')[0],
          plan: 'none',
          isEmailVerified: true, // If Supabase authenticated them, treat as verified
        });
        await this.userRepo.save(user);
      }

      return { success: true, message: 'Login successful', userId: result.userId, name: user.name };
    } catch (err: any) {
      this.logger.error(`[Auth] signInWithPassword error: ${err.message}`);
      return { success: false, message: err.message || 'Login failed' };
    }
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`[Auth] Forgot password OTP requested for ${email}`);
    try {
      const result = await this.supabaseService.forgotPassword(email);
      if (!result.success) {
        return { success: false, message: result.message };
      }

      // Send our custom verification email too
      const trimmedEmail = email.toLowerCase().trim();
      const user = await this.userRepo.findOne({ where: { email: trimmedEmail } });
      if (user) {
        const otp = this.generateSixDigitOtp();
        user.otpCode = otp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.userRepo.save(user);

        const emailSubject = 'Reset your xyz.ai password';
        const emailBody = `Hi ${user.name},\n\nWe received a request to reset your password.\n\nYour 6-digit verification code is: ${otp}\n\nIf you did not make this request, you can safely ignore this email.\n\nBest regards,\nThe xyz.ai Team`;
        await this.outreachService.sendEmail(trimmedEmail, emailSubject, emailBody);
      }

      return { success: true, message: 'Password reset instructions sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Auth] forgotPassword error: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  // ─── Verify Magic Link / Access Token ──────────────────────────────────────
  async verifyLink(accessToken: string): Promise<{ success: boolean; message: string; userId?: string; name?: string; email?: string }> {
    this.logger.log(`[Auth] Verifying magic link/token`);
    return this.supabaseService.verifyLink(accessToken);
  }

  // ─── Update Password ──────────────────────────────────────────────────────
  async updatePassword(accessToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`[Auth] Updating password via token`);
    return this.supabaseService.updatePassword(accessToken, newPassword);
  }

  // ─── Send OTP (Login / Resend OTP) ───────────────────────────────────────
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`[Auth] Custom Send OTP request for ${email}`);
    
    try {
      const trimmedEmail = email.toLowerCase().trim();
      const user = await this.userRepo.findOne({ where: { email: trimmedEmail } });
      if (!user) {
        return { success: false, message: 'Account not found. Please sign up first.' };
      }

      // Generate and store custom OTP
      const otp = this.generateSixDigitOtp();
      user.otpCode = otp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
      await this.userRepo.save(user);

      // Send the OTP email directly via our verified backend SMTP transporter
      const emailSubject = 'Your xyz.ai Verification Code';
      const emailBody = `Hi ${user.name},\n\nHere is your 6-digit verification OTP code to log in: ${otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nThe xyz.ai Team`;
      
      const sent = await this.outreachService.sendEmail(trimmedEmail, emailSubject, emailBody);
      if (!sent) {
        this.logger.error(`[Auth] Failed to send custom login OTP email to ${trimmedEmail}`);
        return { success: false, message: 'Failed to send verification email. Please try again.' };
      }

      this.logger.log(`[Auth] Custom login OTP email sent successfully to ${trimmedEmail}`);
      return { success: true, message: 'Verification OTP sent to your email' };
    } catch (err: any) {
      this.logger.error(`[Auth] sendOtp error: ${err.message}`);
      return { success: false, message: err.message || 'Failed to send OTP code' };
    }
  }

  // ─── Verify OTP ──────────────────────────────────────────────────────────
  async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string; userId?: string; name?: string }> {
    this.logger.log(`[Auth] Custom Verify OTP request for ${email}`);
    
    try {
      const trimmedEmail = email.toLowerCase().trim();
      const user = await this.userRepo.findOne({ where: { email: trimmedEmail } });
      if (!user) {
        return { success: false, message: 'Account not found' };
      }

      // Check OTP code and expiry
      if (!user.otpCode || !user.otpExpiresAt) {
        return { success: false, message: 'No OTP code found. Please request a new one.' };
      }

      if (user.otpExpiresAt.getTime() < Date.now()) {
        return { success: false, message: 'OTP code has expired. Please request a new one.' };
      }

      if (user.otpCode !== otp.trim()) {
        return { success: false, message: 'Invalid OTP code entered' };
      }

      // OTP is valid! Clear it and mark email verified
      user.otpCode = null;
      user.otpExpiresAt = null;
      user.isEmailVerified = true;
      await this.userRepo.save(user);

      this.logger.log(`[Auth] Custom OTP verification succeeded for ${trimmedEmail}`);
      return { success: true, message: 'Email verified', userId: user.id, name: user.name };
    } catch (err: any) {
      this.logger.error(`[Auth] verifyOtp error: ${err.message}`);
      return { success: false, message: err.message || 'Failed to verify OTP code' };
    }
  }
}
