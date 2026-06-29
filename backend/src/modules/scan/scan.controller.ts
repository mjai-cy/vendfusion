import { Controller, Post, Body } from '@nestjs/common';
import { ScanService } from './scan.service';

@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post('website')
  async scanWebsite(@Body('url') url: string) {
    if (!url) return { success: false, message: 'URL is required' };
    const report = await this.scanService.generateReport(url);
    return { success: true, report, leads: report.leads };
  }

  // Free AI persona tool — no auth required
  @Post('persona')
  async generatePersona(@Body('url') url: string) {
    if (!url) return { success: false, message: 'URL is required' };
    const personas = await this.scanService.generatePersonas(url);
    return { success: true, personas };
  }
}
