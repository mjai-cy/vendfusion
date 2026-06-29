import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('workspaces/:id/settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  getSettings(@Param('id') id: string) {
    return this.service.getSettings(id);
  }

  @Patch()
  updateSettings(@Param('id') id: string, @Body() body: {
    linkedInConnected?: boolean;
    linkedInWeeklyLimit?: number;
    linkedInActiveDays?: string[];
    autoEnrichEmails?: boolean;
    autoEnrichPhones?: boolean;
    autoGenerateMessages?: boolean;
    excludeServiceProviders?: boolean;
  }) {
    return this.service.updateSettings(id, body);
  }
}
