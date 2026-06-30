import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

const PLAN_AMOUNT = 1299; // ₹1,299/month — Pro Plan

// ─── Indian UTR format validators ─────────────────────────────────────────────
// IMPS/UPI UTR: 12 numeric digits (e.g. 123456789012)
// NEFT/RTGS: 16-22 alphanumeric starting with bank code (e.g. ICIC2024123456789)
const UTR_REGEX = /^[A-Z0-9]{12,22}$/i;

// Luhn algorithm for real card number validation
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

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
  // IMPORTANT: We do NOT auto-activate Pro. Payment is marked 'pending'
  // and must be manually verified by an admin before activation.
  @Post('verify-upi')
  async verifyUpi(@Body() body: { email: string; utrNumber: string }) {
    const { email, utrNumber } = body;

    if (!email || !utrNumber) {
      return { success: false, message: 'Email and UTR number are required' };
    }

    // Validate UTR format (12-22 alphanumeric)
    const cleaned = utrNumber.trim().toUpperCase();
    if (!UTR_REGEX.test(cleaned)) {
      return {
        success: false,
        message: 'Invalid UTR format. Must be 12-22 alphanumeric characters (e.g. 123456789012 for IMPS/UPI).',
      };
    }

    // Check for duplicate UTR (prevent reuse)
    const alreadyUsed = await this.supabaseService.isPaymentReferenceUsed(cleaned);
    if (alreadyUsed) {
      this.logger.warn(`[Billing] Duplicate UTR submission: ${cleaned} for ${email}`);
      return {
        success: false,
        message: 'This UTR number has already been submitted. Contact support if this is a mistake.',
      };
    }

    // Record payment as PENDING — admin must verify before Pro is activated
    await this.supabaseService.recordPendingPayment(email, 'upi', cleaned);
    this.logger.log(`[Billing] UPI payment PENDING for ${email}. UTR: ${cleaned}`);

    return {
      success: true,
      pending: true,
      message: 'Payment submitted for verification. Pro plan will be activated within 24 hours after admin confirms the transfer.',
      plan: 'pending',
    };
  }

  // ─── Verify card payment ───────────────────────────────────────────────────
  // NOTE: No real payment gateway integrated yet. Card details are NOT stored.
  // This endpoint requires Razorpay/Stripe integration for production.
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

    // Validate card number format
    const digits = cardNumber.replace(/\s/g, '');
    if (!/^\d{15,16}$/.test(digits)) {
      return { success: false, message: 'Invalid card number — must be 15 or 16 digits' };
    }

    // Run Luhn algorithm (real checksum, not just length)
    if (!luhnCheck(digits)) {
      return { success: false, message: 'Invalid card number — failed checksum validation' };
    }

    // Validate expiry format MM/YY
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      return { success: false, message: 'Invalid expiry format — use MM/YY' };
    }

    // Check card is not expired
    const [month, year] = expiry.split('/').map(Number);
    const now = new Date();
    const expDate = new Date(2000 + year, month - 1);
    if (expDate < now) {
      return { success: false, message: 'Card has expired' };
    }

    // Validate CVV (3 digits for Visa/MC, 4 for Amex)
    const isAmex = digits.startsWith('34') || digits.startsWith('37');
    const expectedCvvLen = isAmex ? 4 : 3;
    if (!/^\d+$/.test(cvv) || cvv.length !== expectedCvvLen) {
      return { success: false, message: `Invalid CVV — must be ${expectedCvvLen} digits` };
    }

    // ⚠️ IMPORTANT: No real payment gateway configured. Log reference and mark pending.
    // Integrate Razorpay (https://razorpay.com) or Stripe for real card charging.
    const reference = `CARD-${Date.now()}-${digits.slice(-4)}`;
    await this.supabaseService.recordPendingPayment(email, 'card', reference);
    this.logger.warn(`[Billing] Card payment PENDING for ${email}. Ref: ${reference} — NO REAL CHARGE MADE. Razorpay integration required.`);

    return {
      success: true,
      pending: true,
      message: 'Card details validated. Payment will be processed and Pro plan activated within 24 hours.',
      plan: 'pending',
    };
  }

  // ─── Activate plan (admin-only endpoint — call only after manual verification) ─
  @Post('activate')
  async activatePlan(@Body() body: { email: string; plan: string; adminSecret?: string }) {
    const { email, plan, adminSecret } = body;
    if (!email) return { success: false, message: 'Email required' };

    // Basic admin secret check — set ADMIN_SECRET env var to protect this endpoint
    const requiredSecret = process.env.ADMIN_SECRET;
    if (requiredSecret && adminSecret !== requiredSecret) {
      this.logger.warn(`[Billing] Unauthorized activate attempt for ${email}`);
      return { success: false, message: 'Unauthorized' };
    }

    if (plan === 'pro') {
      await this.supabaseService.activateProPlan(email);
      this.logger.log(`[Billing] Plan manually activated for ${email}: ${plan}`);
      return { success: true, message: `${plan} plan activated`, plan };
    }

    return { success: false, message: 'Unknown plan' };
  }
}
