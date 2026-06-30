import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Workspace } from './workspace.entity';

@Entity('agents')
export class Agent {
  @Column({ primary: true })
  id: string;

  @Column()
  name: string;

  @Column()
  type: 'autopilot' | 'onetime' | 'subagent';

  @Column({ default: 'active' })
  status: 'active' | 'paused' | 'completed';

  @Column({ type: 'jsonb', nullable: true })
  icp: {
    jobTitles: string[];
    industries: string[];
    companySizes: string[];
    locations: string[];
    companyTypes: string[];
    additionalCriteria: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  signals: {
    companyLinkedIn: string;
    engagementKeywords: string[];
    influencers: string[];
    triggerTopIcp: boolean;
    triggerFunding: boolean;
    triggerJobChanges: boolean;
    linkedInGroups: string[];
    linkedInEvents: string[];
    competitors: string[];
    excludedCompanies: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  logs: { message: string; time: string }[];

  @Column({ default: 0 })
  leadsAnalyzed: number;

  @Column({ default: 0 })
  icpMatchCount: number;

  @Column({ default: 0 })
  leadsSavedCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Workspace, ws => ws.agents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  workspaceId: string;
}
