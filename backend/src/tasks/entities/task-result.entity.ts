import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { Department } from '../../departments/entities/department.entity';
import { User } from '../../users/entities/user.entity';

@Entity('task_results')
export class TaskResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskId: number;

  @ManyToOne(() => Task, (task) => task.results)
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column({ nullable: true })
  departmentId: number;

  @ManyToOne(() => Department, { nullable: true, eager: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  completionRate: number;

  @Column({ type: 'json', nullable: true })
  attachments: Array<{ url: string; name: string; size?: number }>;

  @Column({ default: false })
  isExplanation: boolean;

  @Column({ nullable: true })
  submittedById: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'submittedById' })
  submittedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
