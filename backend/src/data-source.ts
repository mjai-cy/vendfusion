import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  ssl: dbUrl?.includes('supabase.co') ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
