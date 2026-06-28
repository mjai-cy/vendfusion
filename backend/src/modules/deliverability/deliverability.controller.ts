import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { DeliverabilityService, DeliveryLog, SenderMailbox, DeliverabilityStats } from './deliverability.service';

@Controller('deliverability')
export class DeliverabilityController {
  constructor(private readonly svc: DeliverabilityService) {}

  @Get('stats')
  getStats(): DeliverabilityStats {
    return this.svc.getStats();
  }

  @Get('logs')
  getLogs(): DeliveryLog[] {
    return this.svc.getLogs();
  }

  @Get('senders')
  getSenders(): SenderMailbox[] {
    return this.svc.getSenders();
  }

  @Patch('senders/:id')
  updateSender(@Param('id') id: string, @Body() data: Partial<SenderMailbox>): SenderMailbox | null {
    return this.svc.updateSender(id, data);
  }

  @Post('webhook/bounce')
  handleBounce(@Body() payload: { to: string; subject: string; error?: string; type?: 'bounce' | 'spam' | 'delivered' }) {
    this.svc.handleBounce(payload);
    return { received: true };
  }

  @Post('log-send')
  logSend(@Body('to') to: string, @Body('subject') subject: string, @Body('campaignId') campaignId?: string): DeliveryLog {
    return this.svc.logSend(to, subject, campaignId);
  }

  @Post('log-open/:id')
  logOpen(@Param('id') id: string) {
    this.svc.logOpen(id);
    return { opened: true };
  }
}
