import { Controller, Get, Post, Body } from '@nestjs/common';
import { PaymentService, PaymentConfig } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('config')
  async getConfig(): Promise<PaymentConfig> {
    return this.paymentService.getConfig();
  }

  @Post('config')
  async updateConfig(@Body() newConfig: Partial<PaymentConfig>): Promise<PaymentConfig> {
    return this.paymentService.updateConfig(newConfig);
  }
}
