import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskResult } from './entities/task-result.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskResultDto } from './dto/create-task-result.dto';
import { TaskStatus } from '../common/enums/task-status.enum';
import { Department } from '../departments/entities/department.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
    @InjectRepository(TaskResult)
    private taskResultsRepo: Repository<TaskResult>,
    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,
  ) {}

  async create(dto: CreateTaskDto, assignedById: number): Promise<Task> {
    const cooperatingDepartments = dto.cooperatingDepartmentIds?.length
      ? await this.departmentsRepo.findBy({ id: In(dto.cooperatingDepartmentIds) })
      : [];

    const task = this.tasksRepo.create({
      ...dto,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      cooperatingDepartments,
      assignedById,
      status: TaskStatus.PENDING,
    });
    return this.tasksRepo.save(task);
  }

  async findAll(filters: {
    status?: TaskStatus;
    departmentId?: number;
    deadlineFrom?: string;
    deadlineTo?: string;
  }): Promise<Task[]> {
    const qb = this.tasksRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.leadDepartment', 'leadDepartment')
      .leftJoinAndSelect('task.cooperatingDepartments', 'cooperatingDepartments')
      .leftJoinAndSelect('task.results', 'results')
      .orderBy('task.createdAt', 'DESC');

    if (filters.status) {
      qb.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters.departmentId) {
      qb.andWhere(
        '(task.leadDepartmentId = :deptId OR task.id IN ' +
        '(SELECT t2.id FROM tasks t2 ' +
        'INNER JOIN task_cooperating_departments tcd ON tcd."taskId" = t2.id ' +
        'WHERE tcd."departmentId" = :deptId))',
        { deptId: filters.departmentId },
      );
    }

    if (filters.deadlineFrom) {
      qb.andWhere('task.deadline >= :deadlineFrom', { deadlineFrom: new Date(filters.deadlineFrom) });
    }

    if (filters.deadlineTo) {
      qb.andWhere('task.deadline <= :deadlineTo', { deadlineTo: new Date(filters.deadlineTo + 'T23:59:59') });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepo.findOne({
      where: { id },
      relations: ['leadDepartment', 'cooperatingDepartments', 'results', 'results.department', 'results.submittedBy'],
    });
    if (!task) throw new NotFoundException(`Công việc #${id} không tồn tại`);
    task.results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return task;
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (dto.cooperatingDepartmentIds !== undefined) {
      task.cooperatingDepartments = dto.cooperatingDepartmentIds.length
        ? await this.departmentsRepo.findBy({ id: In(dto.cooperatingDepartmentIds) })
        : [];
    }

    if (dto.deadline) task.deadline = new Date(dto.deadline);
    const { cooperatingDepartmentIds: _, deadline: __, ...rest } = dto;
    Object.assign(task, rest);

    return this.tasksRepo.save(task);
  }

  async syncOverdueStatuses(): Promise<void> {
    await this.tasksRepo
      .createQueryBuilder()
      .update(Task)
      .set({ status: TaskStatus.OVERDUE })
      .where('deadline < :now AND status NOT IN (:...doneStatuses)', {
        now: new Date(),
        doneStatuses: [TaskStatus.COMPLETED, TaskStatus.OVERDUE],
      })
      .execute();
  }

  async addResult(
    taskId: number,
    dto: CreateTaskResultDto,
    submittedById: number,
    departmentId: number,
  ): Promise<TaskResult> {
    await this.findOne(taskId);
    const result = this.taskResultsRepo.create({
      taskId,
      departmentId,
      submittedById,
      ...dto,
    });
    return this.taskResultsRepo.save(result);
  }

  async getResults(taskId: number): Promise<TaskResult[]> {
    await this.findOne(taskId);
    return this.taskResultsRepo.find({
      where: { taskId },
      relations: ['department', 'submittedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  getStats() {
    return this.tasksRepo
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('task.status')
      .getRawMany();
  }
}
