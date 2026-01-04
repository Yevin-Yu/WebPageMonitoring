import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Relation
} from 'typeorm';
import { User } from './User';
import { PageVisit } from './PageVisit';
import { PerformanceMetric } from './PerformanceMetric';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  key!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: '' })
  website?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  user!: Relation<User>;

  @OneToMany(() => PageVisit, (visit) => visit.project)
  visits!: Relation<PageVisit[]>;

  @OneToMany(() => PerformanceMetric, (metric) => metric.project)
  performanceMetrics!: Relation<PerformanceMetric[]>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
