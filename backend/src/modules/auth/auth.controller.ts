import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Signup: creates account with password + sends confirmation link ─────
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

  // ─── Forgot password: sends recovery link ────────────────────────────────
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      return { success: false, message: 'Email address is required' };
    }
    return this.authService.forgotPassword(email);
  }

  // ─── Verify link clicked (confirmation or recovery) ──────────────────────
  @Post('verify-link')
  async verifyLink(@Body('accessToken') accessToken: string) {
    if (!accessToken) {
      return { success: false, message: 'Access token is required' };
    }
    return this.authService.verifyLink(accessToken);
  }

  // ─── Update password (after recovery link click) ─────────────────────────
  @Post('update-password')
  async updatePassword(@Body('accessToken') accessToken: string, @Body('newPassword') newPassword: string) {
    if (!accessToken || !newPassword) {
      return { success: false, message: 'Access token and new password are required' };
    }
    if (newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }
    return this.authService.updatePassword(accessToken, newPassword);
  }
}
