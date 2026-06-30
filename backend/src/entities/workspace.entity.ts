import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Lead } from './lead.entity';
import { Campaign } from './campaign.entity';
import { Visitor } from './visitor.entity';
import { UploadedFile } from './uploaded-file.entity';
import { Agent } from './agent.entity';
import { LeadList } from './lead-list.entity';

@Entity('workspaces')
export class Workspace {
  @Column({ primary: true })
  id: string;

  @Column()
  name: string;

  @Column()
  domain: string;

  @Column({ type: 'jsonb', nullable: true })
  scanReport: any;

  @Column({ default: 0 })
  leadSearchesThisMonth: number;

  @Column({ default: 0 })
  aiMessagesThisMonth: number;

  @Column({ default: false })
  linkedInConnected: boolean;

  @Column({ default: 100 })
  linkedInWeeklyLimit: number;

  @Column({ type: 'simple-array', default: 'Mon,Tue,Wed,Thu,Fri' })
  linkedInActiveDays: string[];

  @Column({ default: false })
  autoEnrichEmails: boolean;

  @Column({ default: false })
  autoEnrichPhones: boolean;

  @Column({ default: false })
  autoGenerateMessages: boolean;

  @Column({ default: false })
  excludeServiceProviders: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.workspaces, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Lead, lead => lead.workspace)
  leads: Lead[];

  @OneToMany(() => Campaign, camp => camp.workspace)
  campaigns: Campaign[];

  @OneToMany(() => Agent, agent => agent.workspace)
  agents: Agent[];

  @OneToMany(() => LeadList, ll => ll.workspace)
  leadLists: LeadList[];

  @OneToMany(() => Visitor, v => v.workspace)
  visitors: Visitor[];

  @OneToMany(() => UploadedFile, f => f.workspace)
  uploadedFiles: UploadedFile[];
}
