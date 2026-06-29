import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryColumn()
  key: string;

  @Column({ type: 'jsonb' })
  value: any;
}
