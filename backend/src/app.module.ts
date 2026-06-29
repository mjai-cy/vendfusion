import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SecurityModule } from './modules/security/security.module';
import { AiModule } from './modules/ai/ai.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { OutreachModule } from './modules/outreach/outreach.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { ApolloModule } from './modules/apollo/apollo.module';
import { ScanModule } from './modules/scan/scan.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AgentModule } from './modules/agent/agent.module';
import { LeadListModule } from './modules/lead-list/lead-list.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule,
    AiModule,
    SupabaseModule,
    OutreachModule,
    CalendarModule,
    ApolloModule,
    ScanModule,
    AuthModule,
    AgentModule,
    LeadListModule,
    CampaignModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
