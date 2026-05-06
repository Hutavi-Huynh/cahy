import { apiGet, apiPatch } from './api'
import type { Notification } from '@/types'

export const notificationsService = {
  getAll: () => apiGet<Notification[]>('/notifications'),
  countUnread: () => apiGet<number>('/notifications/unread-count'),
  markAsRead: (id: number) => apiPatch(`/notifications/${id}/read`),
  markAllAsRead: () => apiPatch('/notifications/read-all'),
}
