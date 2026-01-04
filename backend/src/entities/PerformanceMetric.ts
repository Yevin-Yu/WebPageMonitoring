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

@Entity('performance_metrics')
@Index(['project', 'metricDate'])
export class PerformanceMetric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  projectId!: string;

  @ManyToOne(() => Project, (project) => project.performanceMetrics, { onDelete: 'CASCADE' })
  project!: Relation<Project>;

  @Column()
  sessionId!: string;

  @Column()
  pageUrl!: string;

  @Column({ type: 'float', nullable: true })
  pageLoadTime?: number;

  @Column({ type: 'float', nullable: true })
  domContentLoadedTime?: number;

  @Column({ type: 'float', nullable: true })
  firstPaint?: number;

  @Column({ type: 'float', nullable: true })
  firstContentfulPaint?: number;

  @Column({ type: 'int', nullable: true })
  resourceCount?: number;

  @Column({ type: 'int', nullable: true })
  errorCount?: number;

  @Column({ type: 'json', nullable: true })
  resources?: Array<{
    name: string;
    duration: number;
    size: number;
    type: string;
  }>;

  @Column({ type: 'json', nullable: true })
  errors?: Array<{
    message: string;
    source: string;
    line: number;
    col: number;
  }>;

  @Column({ type: 'date' })
  metricDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
