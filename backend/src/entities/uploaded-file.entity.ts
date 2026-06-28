import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Workspace } from './workspace.entity';

@Entity('uploaded_files')
export class UploadedFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  size: string;

  @Column()
  type: string;

  @Column({ default: 'processing' })
  status: 'processing' | 'chunked' | 'embedded';

  @Column({ default: 0 })
  chunks: number;

  @Column({ type: 'text', default: '' })
  extractedText: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => Workspace, ws => ws.uploadedFiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  workspaceId: string;
}
