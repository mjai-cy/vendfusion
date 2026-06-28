import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Workspace } from './workspace.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'none' })
  plan: 'none' | 'starter' | 'pro';

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: 'manual' })
  mode: 'manual' | 'pro-ai';

  @Column({ nullable: true })
  apolloApiKey: string;

  @Column({ nullable: true })
  zohoAuthToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Workspace, ws => ws.user)
  workspaces: Workspace[];
}
