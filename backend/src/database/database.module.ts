import { Module, Global, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Workspace, Lead, Campaign, Visitor, UploadedFile, SystemSetting, Agent, LeadList } from '../entities';

function getDatabaseConfig() {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!url) {
    Logger.warn('[Database] No PostgreSQL Database URL found. Running in sqlite sandbox mode.');
    return {
      type: 'sqlite' as const,
      database: ':memory:',
      entities: [User, Workspace, Lead, Campaign, Visitor, UploadedFile, SystemSetting, Agent, LeadList],
      synchronize: true,
      logging: false,
    };
  }

  return {
    type: 'postgres' as const,
    url,
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
