export enum Role {
  ADMIN = 'admin',
  UNIT_LEAD = 'unit_lead',
  UNIT_MEMBER = 'unit_member',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

export enum TaskFrequency {
  ONCE = 'once',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

export interface Department {
  id: number
  code: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  username: string
  fullName: string
  role: Role
  departmentId?: number
  department?: Department
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskResult {
  id: number
  taskId: number
  departmentId?: number
  department?: Department
  content?: string
  completionRate?: number
  attachments?: Array<{ url: string; name: string; size?: number } | string>
  isExplanation?: boolean
  submittedById?: number
  submittedBy?: User
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: number
  title: string
  content?: string
  leadDepartmentId?: number
  leadDepartment?: Department
  cooperatingDepartments: Department[]
  status: TaskStatus
  frequency: TaskFrequency
  deadline?: string
  reminderBefore?: number
  linhVuc?: string
  assignedById?: number
  assignedBy?: User
  results: TaskResult[]
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: number
  userId: number
  taskId?: number
  task?: Task
  title: string
  message: string
  isRead: boolean
  scheduledAt?: string
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
}

export interface AuthResponse {
  accessToken: string
  user: Omit<User, 'password'>
}

export interface TaskStats {
  status: TaskStatus
  count: string
}

export interface ReportSummary {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
}
