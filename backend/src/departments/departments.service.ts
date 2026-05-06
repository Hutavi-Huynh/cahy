import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,
  ) {}

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const exists = await this.departmentsRepo.findOne({ where: { code: dto.code } });
    if (exists) throw new ConflictException(`Mã đơn vị "${dto.code}" đã tồn tại`);

    const dept = this.departmentsRepo.create(dto);
    return this.departmentsRepo.save(dept);
  }

  findAll(): Promise<Department[]> {
    return this.departmentsRepo.find({ order: { code: 'ASC' } });
  }

  async findOne(id: number): Promise<Department> {
    const dept = await this.departmentsRepo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException(`Đơn vị #${id} không tồn tại`);
    return dept;
  }

  async update(id: number, dto: UpdateDepartmentDto): Promise<Department> {
    const dept = await this.findOne(id);
    Object.assign(dept, dto);
    return this.departmentsRepo.save(dept);
  }

  async toggleActive(id: number): Promise<Department> {
    const dept = await this.findOne(id);
    dept.isActive = !dept.isActive;
    return this.departmentsRepo.save(dept);
  }
}
