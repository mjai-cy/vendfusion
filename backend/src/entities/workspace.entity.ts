import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Lead } from './lead.entity';
import { Campaign } from './campaign.entity';
import { Visitor } from './visitor.entity';
import { UploadedFile } from './uploaded-file.entity';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
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

  @OneToMany(() => Visitor, v => v.workspace)
  visitors: Visitor[];

  @OneToMany(() => UploadedFile, f => f.workspace)
  uploadedFiles: UploadedFile[];
}
