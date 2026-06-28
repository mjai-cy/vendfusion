import { Controller, Get, Post, Body } from '@nestjs/common';
import { PaymentService, PaymentConfig } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('config')
  getConfig(): PaymentConfig {
    return this.paymentService.getConfig();
  }

  @Post('config')
  updateConfig(@Body() newConfig: Partial<PaymentConfig>): PaymentConfig {
    return this.paymentService.updateConfig(newConfig);
  }
}
