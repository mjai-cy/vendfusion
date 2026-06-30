import { Entity, Column, CreateDateColumn } from 'typeorm';

@Entity('campaigns')
export class Campaign {
  @Column({ primary: true })
  id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  leadListId: string;

  @Column({ type: 'text', nullable: true })
  inviteMessage: string;

  @Column({ type: 'text', nullable: true })
  followUpMessage: string;

  @Column({ default: 'linkedin' })
  channel: 'email' | 'linkedin' | 'multichannel';

  @Column({ default: 0 })
  sentCount: number;

  @Column({ default: 0 })
  replyCount: number;

  @Column({ default: 0 })
  meetingCount: number;

  @Column({ default: 'draft' })
  status: 'draft' | 'active' | 'paused' | 'completed';

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  workspaceId: string;
}
