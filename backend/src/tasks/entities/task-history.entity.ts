import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('task_histories')
export class TaskHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskId: number;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column()
  changedById: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changedById' })
  changedBy: User;

  @Column({ type: 'text', nullable: true })
  changeDescription: string;

  @Column({ type: 'json', nullable: true })
  oldValue: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  newValue: Record<string, any>;

  @CreateDateColumn()
  changedAt: Date;
}
