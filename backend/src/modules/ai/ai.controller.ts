import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-outreach')
  async generateEmail(
    @Body('leadName') leadName: string,
    @Body('role') role: string,
    @Body('company') company: string,
    @Body('triggers') triggers: string[],
    @Body('companyDescription') companyDescription?: string,
  ) {
    return this.aiService.generateOutreach(leadName, role, company, triggers, companyDescription);
  }

  @Post('generate-linkedin')
  async generateLinkedIn(
    @Body('leadName') leadName: string,
    @Body('role') role: string,
    @Body('company') company: string,
    @Body('triggers') triggers: string[],
    @Body('companyDescription') companyDescription?: string,
  ) {
    return this.aiService.generateLinkedInMessage(leadName, role, company, triggers, companyDescription);
  }
}
