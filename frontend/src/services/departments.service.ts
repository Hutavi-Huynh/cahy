import { apiGet, apiPost, apiPatch } from './api'
import type { Department } from '@/types'

export const departmentsService = {
  getAll: () => apiGet<Department[]>('/departments'),
  getOne: (id: number) => apiGet<Department>(`/departments/${id}`),
  create: (data: { code: string; name: string; description?: string }) =>
    apiPost<Department>('/departments', data),
  update: (id: number, data: Partial<Department>) => apiPatch<Department>(`/departments/${id}`, data),
  toggleActive: (id: number) => apiPatch<Department>(`/departments/${id}/toggle-active`),
}
