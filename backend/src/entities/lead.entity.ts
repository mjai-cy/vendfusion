import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Workspace } from './workspace.entity';

@Entity('leads')
export class Lead {
  @Column({ primary: true })
  id: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column()
  companyName: string;

  @Column({ default: '' })
  domain: string;

  @Column({ default: 0 })
  intentScore: number;

  @Column({ type: 'simple-array', nullable: true })
  intentSignals: string[];

  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  whatsapp: string;

  @Column({ type: 'jsonb', nullable: true })
  outreachDrafts: any;

  @Column({ default: 'new' })
  status: 'new' | 'reviewing' | 'sent' | 'interested' | 'meeting_booked' | 'ignored';

  @Column({ default: 'not_synced' })
  crmSyncStatus: 'not_synced' | 'synced';

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Workspace, ws => ws.leads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  workspaceId: string;
}
