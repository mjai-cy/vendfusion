import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../../entities';

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
export class PaymentService implements OnModuleInit {
  private readonly defaultConfig: PaymentConfig = {
    upiId: 'pay.xyz@upi',
    upiEnabled: true,
    bankEnabled: true,
    cardEnabled: true,
    holderName: 'XYZ AI Technologies Private Limited',
    accountNumber: '50200084729103',
    ifscCode: 'HDFC0000012',
    bankName: 'HDFC Bank Ltd',
  };

  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingsRepo: Repository<SystemSetting>,
  ) {}

  async onModuleInit() {
    // Seed default settings if not exists
    const config = await this.settingsRepo.findOne({ where: { key: 'payment_config' } });
    if (!config) {
      await this.settingsRepo.save({
        key: 'payment_config',
        value: this.defaultConfig,
      });
    }
  }

  async getConfig(): Promise<PaymentConfig> {
    const config = await this.settingsRepo.findOne({ where: { key: 'payment_config' } });
    return config ? (config.value as PaymentConfig) : this.defaultConfig;
  }

  async updateConfig(newConfig: Partial<PaymentConfig>): Promise<PaymentConfig> {
    const current = await this.getConfig();
    const updated = {
      ...current,
      ...newConfig,
    };
    await this.settingsRepo.save({
      key: 'payment_config',
      value: updated,
    });
    return updated;
  }
}
