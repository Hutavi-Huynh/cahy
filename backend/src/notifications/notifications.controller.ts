import { Controller, Get, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo của người dùng hiện tại' })
  findAll(@CurrentUser() user: { id: number }) {
    return this.notificationsService.findForUser(user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Đếm thông báo chưa đọc' })
  countUnread(@CurrentUser() user: { id: number }) {
    return this.notificationsService.countUnread(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  markAsRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  markAllAsRead(@CurrentUser() user: { id: number }) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
