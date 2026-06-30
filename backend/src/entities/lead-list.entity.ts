import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Workspace } from './workspace.entity';

@Entity('lead_lists')
export class LeadList {
  @Column({ primary: true })
  id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: 0 })
  leadCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Workspace, ws => ws.leadLists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  workspaceId: string;
}
