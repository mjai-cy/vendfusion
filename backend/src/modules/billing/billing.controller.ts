import { Controller, Post, Body, Headers, RawBodyRequest, Req, Logger } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);
  private stripe: Stripe;

  constructor(private readonly supabaseService: SupabaseService) {
    const key = process.env.STRIPE_SECRET_KEY || '';
    if (key) {
      this.stripe = new Stripe(key, { apiVersion: '2026-06-24.dahlia' });
      this.logger.log('[Billing] Stripe initialized');
    } else {
      this.logger.warn('[Billing] No STRIPE_SECRET_KEY — billing will return mock URLs');
    }
  }

  @Post('checkout')
  async createCheckout(@Body() body: { email: string; plan: string }) {
    const { email, plan } = body;
    if (!email) return { success: false, message: 'Email is required' };

    if (!this.stripe) {
      // Return a mock checkout URL for testing without Stripe keys
      this.logger.warn('[Billing] Stripe not configured — returning mock checkout URL');
      return {
        success: true,
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?mock_payment=success&email=${encodeURIComponent(email)}`,
        mock: true,
      };
    }

    try {
      const priceId = process.env.STRIPE_PRO_PRICE_ID || '';
      if (!priceId) {
        return { success: false, message: 'Stripe price ID not configured' };
      }

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing?payment=cancelled`,
        metadata: { email, plan },
      });

      this.logger.log(`[Billing] Checkout session created for ${email}: ${session.id}`);
      return { success: true, url: session.url, sessionId: session.id };
    } catch (err: any) {
      this.logger.error(`[Billing] Checkout failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!this.stripe) return { received: true };

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody as Buffer,
        sig,
        webhookSecret,
      );
    } catch (err: any) {
      this.logger.error(`[Billing] Webhook signature failed: ${err.message}`);
      return { error: 'Invalid signature' };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email || session.metadata?.email || '';
      if (email) {
        await this.supabaseService.activateProPlan(email);
        this.logger.log(`[Billing] Pro plan activated for ${email}`);
      }
    }

    return { received: true };
  }
}
