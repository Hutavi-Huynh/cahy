import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Tổng hợp thống kê theo khoảng thời gian' })
  @ApiQuery({ name: 'from', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'to', required: false, example: '2025-12-31' })
  getSummary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getSummary(from, to);
  }

  @Get('by-department')
  @ApiOperation({ summary: 'Thống kê công việc theo đơn vị' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getByDepartment(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getByDepartment(from, to);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Danh sách công việc quá hạn' })
  getOverdueTasks() {
    return this.reportsService.getOverdueTasks();
  }
}
