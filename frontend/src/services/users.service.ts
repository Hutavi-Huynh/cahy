import { apiGet, apiPost, apiPatch } from './api'
import type { User } from '@/types'
import type { Role } from '@/types'

export const usersService = {
  getAll: () => apiGet<User[]>('/users'),
  getOne: (id: number) => apiGet<User>(`/users/${id}`),
  create: (data: {
    username: string
    fullName: string
    password: string
    role?: Role
    departmentId?: number
  }) => apiPost<User>('/users', data),
  update: (id: number, data: Partial<User>) => apiPatch<User>(`/users/${id}`, data),
  toggleActive: (id: number) => apiPatch<User>(`/users/${id}/toggle-active`),
  changePassword: (id: number, newPassword: string) =>
    apiPatch<{ message: string }>(`/users/${id}/change-password`, { newPassword }),
}
