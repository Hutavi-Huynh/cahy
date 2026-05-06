import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { TaskFrequency } from '../../common/enums/task-frequency.enum';
import { Department } from '../../departments/entities/department.entity';
import { User } from '../../users/entities/user.entity';
import { TaskResult } from './task-result.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  leadDepartmentId: number;

  @ManyToOne(() => Department, { nullable: true, eager: true })
  @JoinColumn({ name: 'leadDepartmentId' })
  leadDepartment: Department;

  @ManyToMany(() => Department, { eager: true })
  @JoinTable({
    name: 'task_cooperating_departments',
    joinColumn: { name: 'taskId' },
    inverseJoinColumn: { name: 'departmentId' },
  })
  cooperatingDepartments: Department[];

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskFrequency, default: TaskFrequency.ONCE })
  frequency: TaskFrequency;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({ nullable: true })
  reminderBefore: number;

  @Column({ nullable: true, default: null })
  assignedById: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedById' })
  assignedBy: User;

  @OneToMany(() => TaskResult, (result) => result.task, { cascade: true })
  results: TaskResult[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  linhVuc: string;

  @Column({ nullable: true })
  parentTaskId: number;

  @Column({ type: 'text', nullable: true })
  expectedResult: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
