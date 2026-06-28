import { Injectable, Logger } from '@nestjs/common';

export interface SenderMailbox {
  id: string;
  email: string;
  dailyLimit: number;
  sentToday: number;
  warmupStage: 'none' | 'warming' | 'warm';
  reputation: 'good' | 'neutral' | 'poor';
  status: 'active' | 'paused' | 'cooldown';
}

export interface DeliveryLog {
  id: string;
  to: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'opened' | 'bounced' | 'spam' | 'failed';
  campaignId?: string;
  error?: string;
}

export interface DeliverabilityStats {
  totalSent: number;
  delivered: number;
  opened: number;
  bounced: number;
  spam: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  bounceRate: number;
}

@Injectable()
export class DeliverabilityService {
  private readonly logger = new Logger(DeliverabilityService.name);
  private logs: DeliveryLog[] = [];
  private senders: SenderMailbox[] = [];

  constructor() {
    this.senders = [
      { id: 'snd-1', email: process.env.SMTP_USER || 'outbound@xyz.ai', dailyLimit: 200, sentToday: 47, warmupStage: 'warm', reputation: 'good', status: 'active' },
      { id: 'snd-2', email: 'secondary@xyz.ai', dailyLimit: 100, sentToday: 89, warmupStage: 'warming', reputation: 'neutral', status: 'active' },
    ];
  }

  getStats(): DeliverabilityStats {
    const totalSent = this.logs.length;
    const delivered = this.logs.filter(l => l.status === 'delivered' || l.status === 'opened').length;
    const opened = this.logs.filter(l => l.status === 'opened').length;
    const bounced = this.logs.filter(l => l.status === 'bounced').length;
    const spam = this.logs.filter(l => l.status === 'spam').length;
    const failed = this.logs.filter(l => l.status === 'failed').length;

    return {
      totalSent,
      delivered,
      opened,
      bounced,
      spam,
      failed,
      deliveryRate: totalSent ? Math.round((delivered / totalSent) * 100) : 100,
      openRate: delivered ? Math.round((opened / delivered) * 100) : 0,
      bounceRate: totalSent ? Math.round((bounced / totalSent) * 100) : 0,
    };
  }

  getLogs(limit = 50): DeliveryLog[] {
    return this.logs.slice(-limit).reverse();
  }

  getSenders(): SenderMailbox[] {
    return this.senders;
  }

  updateSender(id: string, data: Partial<SenderMailbox>): SenderMailbox | null {
    const idx = this.senders.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.senders[idx] = { ...this.senders[idx], ...data };
    return this.senders[idx];
  }

  handleBounce(payload: { to: string; subject: string; error?: string; type?: 'bounce' | 'spam' | 'delivered' }) {
    const log: DeliveryLog = {
      id: `del-${Date.now()}-${Math.random().toString(36).substring(5)}`,
      to: payload.to,
      subject: payload.subject,
      sentAt: new Date().toISOString(),
      status: payload.type === 'spam' ? 'spam' : payload.type === 'delivered' ? 'delivered' : 'bounced',
      error: payload.error,
    };
    this.logs.push(log);
    this.logger.warn(`Delivery ${log.status}: ${payload.to} — ${payload.error || ''}`);
  }

  logSend(to: string, subject: string, campaignId?: string): DeliveryLog {
    const log: DeliveryLog = {
      id: `del-${Date.now()}-${Math.random().toString(36).substring(5)}`,
      to, subject, campaignId,
      sentAt: new Date().toISOString(),
      status: 'sent',
    };
    this.logs.push(log);
    return log;
  }

  logOpen(deliveryId: string) {
    const log = this.logs.find(l => l.id === deliveryId);
    if (log) log.status = 'opened';
  }
}
