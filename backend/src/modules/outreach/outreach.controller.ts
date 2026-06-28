import { Controller, Post, Body } from '@nestjs/common';
import { OutreachService } from './outreach.service';

@Controller('outreach')
export class OutreachController {
  constructor(private readonly outreachService: OutreachService) {}

  @Post('email')
  async sendEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('body') body: string,
  ) {
    const success = await this.outreachService.sendEmail(to, subject, body);
    return { success };
  }

  @Post('whatsapp')
  async sendWhatsApp(
    @Body('toPhone') toPhone: string,
    @Body('text') text: string,
  ) {
    const success = await this.outreachService.sendWhatsAppMessage(toPhone, text);
    return { success };
  }
}
