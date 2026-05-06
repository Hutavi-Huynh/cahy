import { apiPost } from './api'
import type { AuthResponse } from '@/types'

export const authService = {
  login: (username: string, password: string) =>
    apiPost<AuthResponse>('/auth/login', { username, password }),
}
