import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskResultDto } from './dto/create-task-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { TaskStatus } from '../common/enums/task-status.enum';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tạo công việc mới (Admin)' })
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: { id: number }) {
    return this.tasksService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách công việc' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiQuery({ name: 'departmentId', type: Number, required: false })
  @ApiQuery({ name: 'deadlineFrom', type: String, required: false })
  @ApiQuery({ name: 'deadlineTo', type: String, required: false })
  findAll(
    @CurrentUser() user: { role: Role; departmentId?: number },
    @Query('status') status?: TaskStatus,
    @Query('departmentId', new ParseIntPipe({ optional: true })) departmentId?: number,
    @Query('deadlineFrom') deadlineFrom?: string,
    @Query('deadlineTo') deadlineTo?: string,
  ) {
    // Admin có thể xem tất cả hoặc lọc theo phòng ban tuỳ ý
    // Non-admin chỉ xem nhiệm vụ của phòng ban mình (lead hoặc phối hợp)
    const effectiveDepartmentId = user.role === Role.ADMIN
      ? departmentId
      : user.departmentId;

    return this.tasksService.findAll({
      status,
      departmentId: effectiveDepartmentId,
      deadlineFrom,
      deadlineTo,
    });
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Thống kê công việc theo trạng thái (Admin)' })
  getStats() {
    return this.tasksService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết công việc' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật/Gia hạn công việc (Admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Post(':id/results')
  @ApiOperation({ summary: 'Cập nhật kết quả thực hiện (Đơn vị)' })
  addResult(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() dto: CreateTaskResultDto,
    @CurrentUser() user: { id: number; departmentId: number },
  ) {
    return this.tasksService.addResult(taskId, dto, user.id, user.departmentId);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Xem kết quả thực hiện của công việc' })
  getResults(@Param('id', ParseIntPipe) taskId: number) {
    return this.tasksService.getResults(taskId);
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload file đính kèm cho công việc' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = join(process.cwd(), 'uploads');
        if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, `${unique}${extname(originalName)}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Không có file được upload');
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    return { filename: file.filename, originalName, url: `/uploads/${file.filename}` };
  }
}
