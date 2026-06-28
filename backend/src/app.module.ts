import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SecurityModule } from './modules/security/security.module';
import { AiModule } from './modules/ai/ai.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { PaymentModule } from './modules/payment/payment.module';
import { OutreachModule } from './modules/outreach/outreach.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { ApolloModule } from './modules/apollo/apollo.module';
import { ZohoModule } from './modules/zoho/zoho.module';
import { ScanModule } from './modules/scan/scan.module';
import { SequencesModule } from './modules/sequences/sequences.module';
import { VisitorsModule } from './modules/visitors/visitors.module';
import { DeliverabilityModule } from './modules/deliverability/deliverability.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule,
    AiModule,
    SupabaseModule,
    PaymentModule,
    OutreachModule,
    CalendarModule,
    ApolloModule,
    ZohoModule,
    ScanModule,
    SequencesModule,
    VisitorsModule,
    DeliverabilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
