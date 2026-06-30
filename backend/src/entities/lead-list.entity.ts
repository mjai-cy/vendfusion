import { Entity, Column, CreateDateColumn } from 'typeorm';

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

  @Column()
  workspaceId: string;
}
