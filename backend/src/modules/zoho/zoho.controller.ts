import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { AiPermissionsGuard } from '../security/ai-permissions.guard';

@Controller('zoho')
@UseGuards(AiPermissionsGuard)
export class ZohoController {
  constructor(private readonly zohoService: ZohoService) {}

  @Post('sync')
  async sync(
    @Body('dealId') dealId: string,
    @Body('company') company: string,
    @Body('amount') amount: number,
  ) {
    return this.zohoService.syncDealOpportunity(dealId, company, amount);
  }
}
