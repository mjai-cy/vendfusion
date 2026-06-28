import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Workspace } from './workspace.entity';

@Entity('visitors')
export class Visitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  domain: string;

  @Column({ default: '' })
  companyName: string;

  @Column({ default: '' })
  companyIndustry: string;

  @Column({ default: '' })
  companySize: string;

  @Column({ type: 'jsonb', default: [] })
  pagesVisited: { url: string; title: string; timestamp: string }[];

  @Column({ default: 1 })
  visitCount: number;

  @Column({ default: '' })
  city: string;

  @Column({ default: '' })
  country: string;

  @Column({ default: 'direct' })
  source: string;

  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: 10 })
  score: number;

  @Column({ default: 'new' })
  status: 'new' | 'identified' | 'contacted' | 'qualified';

  @Column({ default: false })
  enriched: boolean;

  @CreateDateColumn()
  firstSeen: Date;

  @UpdateDateColumn()
  lastSeen: Date;

  @ManyToOne(() => Workspace, ws => ws.visitors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column({ nullable: true })
  workspaceId: string;
}
