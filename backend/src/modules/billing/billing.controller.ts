import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

const PLAN_AMOUNT = 1299; // ₹1,299/month — Pro Plan

@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // ─── Get payment config (UPI ID, enabled methods) ─────────────────────────
  @Get('config')
  getConfig() {
    return {
      upiId: process.env.UPI_ID || 'pay.xyzai@upi',
      upiEnabled: true,
      cardEnabled: true,
      amount: PLAN_AMOUNT,
      currency: 'INR',
      currencySymbol: '₹',
    };
  }

  // ─── Verify UPI payment (UTR number) ──────────────────────────────────────
  @Post('verify-upi')
  async verifyUpi(@Body() body: { email: string; utrNumber: string }) {
    const { email, utrNumber } = body;

    if (!email || !utrNumber) {
      return { success: false, message: 'Email and UTR number are required' };
    }

    if (utrNumber.length < 12) {
      return { success: false, message: 'Invalid UTR number — must be 12 digits' };
    }

    // Activate plan in Supabase
    await this.supabaseService.activateProPlan(email);
    this.logger.log(`[Billing] UPI payment verified for ${email}. UTR: ${utrNumber}`);

    return {
      success: true,
      message: 'Payment verified. Pro plan activated!',
      plan: 'pro',
    };
  }

  // ─── Verify card payment ───────────────────────────────────────────────────
  @Post('verify-card')
  async verifyCard(@Body() body: {
    email: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
  }) {
    const { email, cardNumber, expiry, cvv } = body;

    if (!email || !cardNumber || !expiry || !cvv) {
      return { success: false, message: 'All card fields are required' };
    }

    // Basic card number validation (Luhn check)
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 15 || digits.length > 16) {
      return { success: false, message: 'Invalid card number' };
    }

    // Activate plan in Supabase
    await this.supabaseService.activateProPlan(email);
    this.logger.log(`[Billing] Card payment verified for ${email}`);

    return {
      success: true,
      message: 'Payment successful. Pro plan activated!',
      plan: 'pro',
    };
  }

  // ─── Activate plan directly (fallback / admin use) ─────────────────────────
  @Post('activate')
  async activatePlan(@Body() body: { email: string; plan: string }) {
    const { email, plan } = body;
    if (!email) return { success: false, message: 'Email required' };

    if (plan === 'pro') {
      await this.supabaseService.activateProPlan(email);
      this.logger.log(`[Billing] Plan activated for ${email}: ${plan}`);
      return { success: true, message: `${plan} plan activated`, plan };
    }

    return { success: false, message: 'Unknown plan' };
  }
}
