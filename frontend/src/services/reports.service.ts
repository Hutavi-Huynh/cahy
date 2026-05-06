import { apiGet } from './api'
import type { ReportSummary, Task } from '@/types'

export const reportsService = {
  getSummary: (params?: { from?: string; to?: string }) =>
    apiGet<ReportSummary>('/reports/summary', params as Record<string, unknown>),
  getByDepartment: (params?: { from?: string; to?: string }) =>
    apiGet<unknown[]>('/reports/by-department', params as Record<string, unknown>),
  getOverdue: () => apiGet<Task[]>('/reports/overdue'),
}
