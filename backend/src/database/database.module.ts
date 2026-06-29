import { Module, Global, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Workspace, Lead, Campaign, Visitor, UploadedFile, SystemSetting, Agent, LeadList } from '../entities';

function getDatabaseConfig() {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_URL;

  if (!url) {
    Logger.warn('[Database] No DATABASE_URL or SUPABASE_URL found. Running without real database.');
    return null;
  }

  const isSupabase = url.includes('supabase.co') || url.includes('supabase.com');

  if (isSupabase) {
    const anonKey = process.env.SUPABASE_ANON_KEY || '';
    const dbUrl = process.env.SUPABASE_DB_URL || url;
    return {
      type: 'postgres' as const,
      url: dbUrl,
      ssl: { rejectUnauthorized: false },
      entities: [User, Workspace, Lead, Campaign, Visitor, UploadedFile, SystemSetting, Agent, LeadList],
      synchronize: true,
      logging: false,
      extra: {
        max: 10,
        connectionTimeoutMillis: 10000,
      },
    };
  }

  return {
    type: 'postgres' as const,
    url,
    ssl: { rejectUnauthorized: false },
    entities: [User, Workspace, Lead, Campaign, Visitor, UploadedFile, SystemSetting, Agent, LeadList],
    synchronize: true,
    logging: false,
  };
}

@Global()
@Module({
  imports: [
    ...(getDatabaseConfig() ? [TypeOrmModule.forRoot(getDatabaseConfig())] : []),
    TypeOrmModule.forFeature([User, Workspace, Lead, Campaign, Visitor, UploadedFile, SystemSetting, Agent, LeadList]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor() {
    const config = getDatabaseConfig();
    if (config) {
      this.logger.log('PostgreSQL database configured (auto-sync enabled)');
    } else {
      this.logger.warn('No database credentials — running without persistence');
    }
  }
}
