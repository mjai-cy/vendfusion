import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Signup: creates account with password + sends verification OTP ───────
  @Post('signup')
  async signup(@Body('email') email: string, @Body('password') password: string, @Body('name') name: string) {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }
    return this.authService.signUpWithPassword(email, password, name);
  }

  // ─── Login: password-based ───────────────────────────────────────────────
  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }
    return this.authService.signInWithPassword(email, password);
  }

  // ─── Verify OTP (for signup verification) ────────────────────────────────
  @Post('verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    if (!email || !otp) {
      return { success: false, message: 'Email and OTP code are required' };
    }
    return this.authService.verifyOtp(email, otp);
  }

  // ─── Forgot password: sends OTP to reset ─────────────────────────────────
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      return { success: false, message: 'Email address is required' };
    }
    return this.authService.forgotPassword(email);
  }
}
