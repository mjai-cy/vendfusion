import { Injectable } from '@nestjs/common';

export interface PaymentConfig {
  upiId: string;
  upiEnabled: boolean;
  bankEnabled: boolean;
  cardEnabled: boolean;
  holderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

@Injectable()
export class PaymentService {
  private paymentConfig: PaymentConfig = {
    upiId: 'pay.xyz@upi',
    upiEnabled: true,
    bankEnabled: true,
    cardEnabled: true,
    holderName: 'XYZ AI Technologies Private Limited',
    accountNumber: '50200084729103',
    ifscCode: 'HDFC0000012',
    bankName: 'HDFC Bank Ltd',
  };

  getConfig(): PaymentConfig {
    return this.paymentConfig;
  }

  updateConfig(newConfig: Partial<PaymentConfig>): PaymentConfig {
    this.paymentConfig = {
      ...this.paymentConfig,
      ...newConfig,
    };
    return this.paymentConfig;
  }
}
