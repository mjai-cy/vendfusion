import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-outreach')
  async generate(
    @Body('leadName') leadName: string,
    @Body('role') role: string,
    @Body('company') company: string,
    @Body('triggers') triggers: string[],
  ) {
    return this.aiService.generateOutreach(leadName, role, company, triggers);
  }
}
