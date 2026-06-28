import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Workspace } from './workspace.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  template: string;

  @Column({ default: 'multichannel' })
  channel: 'email' | 'linkedin' | 'multichannel';

  @Column({ default: 0 })
  sentCount: number;

  @Column({ default: 0 })
  openRate: number;

  @Column({ default: 0 })
  replyRate: number;

  @Column({ default: 0 })
  meetingsRate: number;

  @Column({ default: 'draft' })
  status: 'draft' | 'active' | 'paused';

  @Column({ type: 'jsonb', nullable: true })
  steps: any[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Workspace, ws => ws.campaigns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  workspaceId: string;
}
