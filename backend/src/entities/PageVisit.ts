import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Relation,
  Index
} from 'typeorm';
import { Project } from './Project';

@Entity('page_visits')
@Index(['project', 'visitDate'])
@Index(['project', 'sessionId'])
export class PageVisit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  projectId!: string;

  @ManyToOne(() => Project, (project) => project.visits, { onDelete: 'CASCADE' })
  project!: Relation<Project>;

  @Column()
  sessionId!: string;

  @Column()
  pageUrl!: string;

  @Column({ nullable: true })
  pageTitle?: string;

  @Column()
  referrer!: string;

  @Column()
  userAgent!: string;

  @Column({ type: 'json', nullable: true })
  screenInfo?: {
    width: number;
    height: number;
    colorDepth: number;
  };

  @Column({ type: 'json', nullable: true })
  browserInfo?: {
    name: string;
    version: string;
  };

  @Column({ type: 'json', nullable: true })
  osInfo?: {
    name: string;
    version: string;
  };

  @Column({ type: 'date' })
  visitDate!: Date;

  @Column({ type: 'time' })
  visitTime!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
