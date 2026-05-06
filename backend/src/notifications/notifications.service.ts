import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
  ) {}

  async findForUser(userId: number): Promise<Notification[]> {
    return this.notificationsRepo.find({
      where: { userId },
      relations: ['task'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: number, userId: number): Promise<void> {
    await this.notificationsRepo.update({ id, userId }, { isRead: true });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepo.update({ userId, isRead: false }, { isRead: true });
  }

  countUnread(userId: number): Promise<number> {
    return this.notificationsRepo.count({ where: { userId, isRead: false } });
  }

  async createReminder(
    userId: number,
    taskId: number,
    title: string,
    message: string,
    scheduledAt: Date,
  ): Promise<Notification> {
    const notification = this.notificationsRepo.create({
      userId,
      taskId,
      title,
      message,
      scheduledAt,
    });
    return this.notificationsRepo.save(notification);
  }
}
