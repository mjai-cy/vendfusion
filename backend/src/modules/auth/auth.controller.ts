import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    if (!email) {
      return { success: false, message: 'Email address is required' };
    }
    return this.authService.sendOtp(email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    if (!email || !otp) {
      return { success: false, message: 'Email and OTP code are required' };
    }
    return this.authService.verifyOtp(email, otp);
  }
}
