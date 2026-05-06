import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TaskResult } from './task-result.entity';
import { User } from '../../users/entities/user.entity';

@Entity('task_result_histories')
export class TaskResultHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskResultId: number;

  @ManyToOne(() => TaskResult, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskResultId' })
  taskResult: TaskResult;

  @Column()
  updatedById: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  completionRate: number;

  @Column({ type: 'json', nullable: true })
  attachments: Array<{ url: string; name: string; size?: number }>;

  @CreateDateColumn()
  createdAt: Date;
}
