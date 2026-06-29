import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface OtpData {
  otp: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private otpMap = new Map<string, OtpData>();

  private getTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false, // port 587 uses STARTTLS
      auth: {
        user: process.env.SMTP_USER || 'outbound@xyz.ai',
        pass: process.env.SMTP_PASS || 'app_password_sandbox_123',
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
    this.otpMap.set(email.toLowerCase(), { otp, expiresAt });

    const transporter = this.getTransporter();
    const mailOptions = {
      from: `"XYZ.AI Outbound" <${process.env.SMTP_USER || 'outbound@xyz.ai'}>`,
      to: email,
      subject: 'Your XYZ.AI Verification OTP',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #1a1a1a; background-color: #030303; color: #ffffff; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center; margin-bottom: 20px;">XYZ.AI Security</h2>
          <p style="font-size: 14px; color: #d1d5db;">Please use the following 6-digit verification code to complete your access to the platform:</p>
          <div style="font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 4px; padding: 15px; background-color: #0f0f18; border: 1px solid #2d2d3d; border-radius: 6px; margin: 25px 0; color: #6366f1;">
            ${otp}
          </div>
          <p style="font-size: 11px; color: #6b7280; text-align: center;">This verification code is valid for the next 5 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      this.logger.log(`[Auth] OTP verification email sent successfully to ${email}`);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      this.logger.error(`[Auth] Failed to send email to ${email}: ${error.message}`);
      return { success: false, message: `Failed to send email: ${error.message}` };
    }
  }

  verifyOtp(email: string, otp: string): { success: boolean; message: string } {
    const key = email.toLowerCase();
    const data = this.otpMap.get(key);

    if (!data) {
      return { success: false, message: 'No verification request active for this email' };
    }

    if (Date.now() > data.expiresAt) {
      this.otpMap.delete(key);
      return { success: false, message: 'Verification OTP has expired' };
    }

    if (data.otp !== otp) {
      return { success: false, message: 'Invalid verification OTP code' };
    }

    // Success! Clear the OTP from memory
    this.otpMap.delete(key);
    return { success: true, message: 'Verification successful' };
  }
}
