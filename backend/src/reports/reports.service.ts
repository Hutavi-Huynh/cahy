import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { TaskStatus } from '../common/enums/task-status.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
  ) {}

  async getSummary(from?: string, to?: string) {
    const where: Record<string, unknown> = {};
    if (from && to) {
      where.createdAt = Between(new Date(from), new Date(to));
    }

    const [total, pending, inProgress, completed, overdue] = await Promise.all([
      this.tasksRepo.count({ where }),
      this.tasksRepo.count({ where: { ...where, status: TaskStatus.PENDING } }),
      this.tasksRepo.count({ where: { ...where, status: TaskStatus.IN_PROGRESS } }),
      this.tasksRepo.count({ where: { ...where, status: TaskStatus.COMPLETED } }),
      this.tasksRepo.count({ where: { ...where, status: TaskStatus.OVERDUE } }),
    ]);

    return { total, pending, inProgress, completed, overdue };
  }

  async getByDepartment(from?: string, to?: string) {
    const qb = this.tasksRepo
      .createQueryBuilder('task')
      .leftJoin('task.leadDepartment', 'dept')
      .select('dept.id', 'departmentId')
      .addSelect('dept.name', 'departmentName')
      .addSelect('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('dept.id, dept.name, task.status')
      .orderBy('dept.name', 'ASC');

    if (from && to) {
      qb.andWhere('task.createdAt BETWEEN :from AND :to', { from, to });
    }

    return qb.getRawMany();
  }

  async getOverdueTasks() {
    return this.tasksRepo.find({
      where: { status: TaskStatus.OVERDUE },
      relations: ['leadDepartment', 'cooperatingDepartments'],
      order: { deadline: 'ASC' },
    });
  }
}
