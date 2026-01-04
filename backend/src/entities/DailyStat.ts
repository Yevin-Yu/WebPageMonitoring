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

@Entity('daily_stats')
@Index(['project', 'statDate'], { unique: true })
export class DailyStat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project!: Relation<Project>;

  @Column({ type: 'date' })
  statDate!: Date;

  @Column({ type: 'int', default: 0 })
  pageViews!: number;

  @Column({ type: 'int', default: 0 })
  uniqueVisitors!: number;

  @Column({ type: 'int', default: 0 })
  sessions!: number;

  @Column({ type: 'float', default: 0 })
  avgPageLoadTime!: number;

  @Column({ type: 'float', default: 0 })
  avgDomContentLoadedTime!: number;

  @Column({ type: 'int', default: 0 })
  bounceRate!: number;

  @Column({ type: 'json', nullable: true })
  topPages?: Array<{
    url: string;
    title: string;
    views: number;
  }>;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'date', nullable: true })
  updatedAt?: Date;
}
